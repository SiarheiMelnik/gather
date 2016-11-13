import logging
import pandas as pd
import numpy as np
from boto import sns
from boto.s3.connection import S3Connection
import json
import os
from dotenv import load_dotenv, find_dotenv
import functools

foldl = lambda func, acc, xs: functools.reduce(func, xs, acc)
lmap = lambda func, xs: functools.reduce(lambda x, y: x + [func(y)], xs, [])
lfilter = lambda func, xs: functools.reduce(lambda x, y: x + [y] if func(y) else x, xs, [])

def compose(*functions):
    return functools.reduce(lambda f, g: lambda x: f(g(x)), functions, lambda x: x)

load_dotenv(find_dotenv())

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sNSConnection = sns.SNSConnection(
    aws_access_key_id=os.environ['AWS_KEY'],
    aws_secret_access_key=os.environ['AWS_SECRET'],
    region=[r for r in sns.regions() if r.name==os.environ['AWS_REGION']][0]
)

s3Connection = S3Connection(
    aws_access_key_id=os.environ['AWS_KEY'],
    aws_secret_access_key=os.environ['AWS_SECRET']
)


def elapsed_lambda(d, percentiles=[50, 90, 95, 99]):
    series = pd.Series({
        'min': np.min(d['elapsed']),
        'max': np.max(d['elapsed']),
        'mean': np.mean(d['elapsed']),
        'std': np.std(d['elapsed'])
    })

    perc = lmap(lambda x: pd.Series({ str(x): np.percentile(d['elapsed'], x) }), percentiles);
    for p in perc:
        series = series.append(p)
    return series

def txn_mapper(df_chunk):
    def run():
        txn_df = df_chunk.groupby('label').apply(elapsed_lambda)
        txn_df['label'] = txn_df.index.astype(str)
        return txn_df.to_dict('records')
    return run

dfilter = lambda df, items: df.filter(items=items).copy()

mdf = {
    'txn': {
        'd_filter': functools.partial(dfilter, items=['label', 'elapsed']),
        'd_mapper': txn_mapper
    }
}

def getMeta(bucket_name, object_key):
    bucket = s3Connection.get_bucket(bucket_name)
    obj = bucket.get_key(object_key)
    return {
        'user': obj.get_metadata('user')
    }

def normalize(raw_df):
    return raw_df.loc[np.nonzero(raw_df['timeStamp'])];

def seq(url):
    jmeter_cols = ['timeStamp', 'elapsed', 'label']
    jmeter_types = { 'timeStamp': np.int64, 'elapsed': np.int64, 'label': str }

    df = normalize(
        pd.read_csv(url, usecols=jmeter_cols, dtype=jmeter_types, index_col=False)
    )

    return lmap(lambda k: [k, compose(mdf[k]['d_mapper'], mdf[k]['d_filter'])(df) ], ['txn'])

def run(event, context):
    logger.info(pd.__version__)
    logger.info(np.version.version)

    s3_event = event['Records'][0]['s3']
    logger.info(s3_event)

    bucket_name = s3_event['bucket']['name']
    object_key = s3_event['object']['key']

    url = 's3://' +bucket_name+ '/' + object_key;

    logger.info(url);

    data = lmap(lambda k: { k[0]: k[1]() }, seq(url))
    meta = getMeta(bucket_name, object_key)

    msg = {
        'meta': meta,
        'data': data
    }

    logger.info(msg)

    ans = sNSConnection.publish(
        target_arn=os.environ['RENDERER_TOPIC'],
        message=json.dumps(msg)
    )

    logger.info(ans);

    response = {
        "statusCode": 200,
    }

    return response
