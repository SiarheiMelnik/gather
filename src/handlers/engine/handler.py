import logging
import pandas as pd
import numpy as np
from boto import sns
from boto.s3.connection import S3Connection
import json
import os
from dotenv import load_dotenv, find_dotenv

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

cols = ['timeStamp', 'elapsed', 'label']
types = { 'timeStamp': np.int64, 'elapsed': np.int64, 'label': str }

def normalize(raw_df):
    return raw_df.loc[np.nonzero(raw_df['timeStamp'])];

def lambda_txn(d):
    _d = d['elapsed']
    return pd.Series({
        'min': np.min(_d),
        'max': np.max(_d),
        'mean': np.mean(_d),
        'std.dev': np.std(_d),
        'median': np.median(_d),
        '90th': np.percentile(_d, 90),
        '95th': np.percentile(_d, 95),
        '99th': np.percentile(_d, 99)
    })

def process_txn(df):
    txn_df = df.groupby('label').apply(lambda_txn)
    txn_df['label'] = txn_df.index.astype(str)
    return txn_df.to_dict('records')

def seq(url):
    df = normalize(
        pd.read_csv(url, usecols=cols, dtype=types, index_col=False)
    )
    return process_txn(df)

def run(event, context):
    logger.info(pd.__version__)
    logger.info(np.version.version)

    s3_event = event['Records'][0]['s3']
    logger.info(s3_event)

    bucket_name = s3_event['bucket']['name']
    object_key = s3_event['object']['key']

    bucket = s3Connection.get_bucket(bucket_name)
    obj = bucket.get_key(object_key)

    url = 's3://' +bucket_name+ '/' + object_key;

    logger.info(url);

    res = seq(url)

    logger.info(res)

    msg = {
        'meta': {
            'user': obj.get_metadata('user')
        },
        'data': [
            {
                'txn': res
            }
        ]
    }

    ans = sNSConnection.publish(
        target_arn=os.environ['RENDERER_TOPIC'],
        message=json.dumps(msg)
    )

    logger.info(ans);

    response = {
        "statusCode": 200,
    }

    return response
