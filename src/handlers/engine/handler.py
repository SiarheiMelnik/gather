import logging
import pandas as pd
import numpy as np
import boto3
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.client('s3')
sns = boto3.client('sns')

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

def seq(data):
    df = normalize(
        pd.read_csv(data, usecols=cols, dtype=types, index_col=False)
    )
    return process_txn(df)

def run(event, context):
    logger.info(pd.__version__)
    logger.info(np.version.version)

    s3_event = event['Records'][0]['s3']
    logger.info(s3_event)

    obj = s3.get_object(
        Bucket=s3_event['bucket']['name'],
        Key=s3_event['object']['key']
    )
    res = seq(obj['Body'])

    logger.info(res)

    msg = sns.publish(
        TopicArn: os.environ.get('RENDERER_TOPIC'),
        Message: res,
        MessageStructure: 'json'
    )

    logger.info(msg)

    response = {
        "statusCode": 200,
    }

    return response
