import json
import logging
import pandas as pd

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def engine(event, context):
    s3 = event['Records'][0]['s3']

    logger.info(s3)

    url = 's3://' + s3['bucket']['name'] + '/' + s3['object']['key']

    logger.info(url)

    df = pd.read_csv(url)

    logger.info(pd.__version__)

    logger.info(df.head())

    response = {
        "statusCode": 200,
    }

    return response
