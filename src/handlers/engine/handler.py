import logging
import pandas as pd
import numpy as np

logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
    s3 = event['Records'][0]['s3']
    url = 's3://' + s3['bucket']['name'] + '/' + s3['object']['key']

    logger.info(pd.__version__)
    logger.info(np.version.version)
    logger.info(url)

    res = seq(url)
    # push to SQS for rendering  ?
    logger.info(res)
    response = {
        "statusCode": 200,
    }

    return response
