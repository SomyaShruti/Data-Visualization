from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from starlette.responses import JSONResponse
import json

app = FastAPI()

# Allow requests from your frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/parquet-data")
def get_parquet_data(request: Request, selected_agg: str = Query(None), selected_column: str = Query(None)):
    # filepath ='truecaller_base_df.parquet'
    filepath='iris.csv'
    df = pd.read_csv(filepath)
    for column in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            df[column] = df[column].dt.strftime('%Y-%m-%d %H:%M:%S')

    if selected_agg and selected_column:
        result = process_data(df, selected_agg, selected_column)
    else:
        result = df.to_dict(orient='records')

    return JSONResponse(content=json.dumps(result), status_code=200)

@app.get("/chart-data")
async def get_chart_data(selected_agg: str, selected_y_columns: str, selected_x_column: str):
    filepath = 'iris.csv'
    df = pd.read_csv(filepath)
    for column in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[column]):
            df[column] = df[column].dt.strftime('%Y-%m-%d %H:%M:%S')
    
    y_columns = selected_y_columns.split(',')  # Split the comma-separated string into a list of columns
    result = process_data(df, selected_agg, y_columns, selected_x_column)

    return JSONResponse(content=result, status_code=200)

def process_data(df, selected_agg, selected_y_columns, selected_x_column):
    result = {}
    for y_column in selected_y_columns:
        if selected_agg == "count":
            agg_result = df.groupby(selected_x_column)[y_column].count().to_dict()
        elif selected_agg == "min":
            agg_result = df.groupby(selected_x_column)[y_column].min().to_dict()
        elif selected_agg == "max":
            agg_result = df.groupby(selected_x_column)[y_column].max().to_dict()
        elif selected_agg == "sum":
            agg_result = df.groupby(selected_x_column)[y_column].sum().to_dict()
        elif selected_agg == "dis-count":
            agg_result = df.groupby(selected_x_column)[y_column].nunique().to_dict()
        elif selected_agg == "none":
            return df.to_dict(orient='records')
        
        for key, value in agg_result.items():
            if key not in result:
                result[key] = {}
            result[key][y_column] = value
    
    arr = []
    for key, values in result.items():
        obj = {selected_x_column: key, **values}
        arr.append(obj)
    
    return arr
