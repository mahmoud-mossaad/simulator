from sqlalchemy import create_engine
import numpy as np
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
import pandas as pd
pd.options.mode.chained_assignment = None


app = Flask(__name__)

#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://username:password@localhost/db_name'

# Here I add my database link
engine = create_engine(
    'mysql+pymysql://siood:123456@localhost/mydb')


CORS(app)


def get_average(value, price_columns, price_data):
    if(value in price_columns):
        print(value)
        return price_data[value]
    else:
        for i in range(0, len(price_columns)-1):
            if value > price_columns[i] and value < price_columns[i+1]:
                print(value)
                print(price_columns[i], price_columns[i+1])
                v1 = price_columns[i]
                v2 = price_columns[i+1]
                u = price_data[v2] - ((v2 - value) *
                                      (price_data[v2] - price_data[v1])/(v2-v1))
                print(u)
                return u


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/editsopbyvalue", methods=['GET', 'POST'])
def editsopbyvalue():
    if request.method == "GET":
        columns = list(data)

        price_columns = [i for i in columns if (
            type(i) is float or type(i) == int)]

        price_data = data.loc[:, data.columns.isin(price_columns)]

        price = get_average(float(request.args.get('value')), price_columns=price_columns,
                            price_data=price_data)

        sku_columns = []
        ######################################################################
        for i in columns:                                                    #
            if(i not in price_columns):                                      #
                if(i != 'NONE' and i != 'RLH' and i != 'Respondent'):        #
                    sku_columns.append(i)                                    #
                    #
        sku_data = data.loc[:, data.columns.isin(sku_columns)]               #
        res_count = len(sku_data.index)                                      #
        # Data preparation                                                   #
        #
        for i in range(0, len(sku_columns)):                                 #
            #
            sku_data.iloc[:, i] = np.exp(                                    #
                (sku_data.iloc[:, i] + price))               #
        # change the repondent weight                                        #
        sku_data['sum'] = sku_data.iloc[:, 0:res_count].sum(axis=1)          #
        #
        ######################################################################
        #########################################################################################################
        #
        for index, row in sku_data.iterrows():

            #print(sku_data.iloc[index, :])
            #
            sku_data.iloc[index, :] = row/sku_data['sum'][index]
            #
        sku_data = sku_data.append(sku_data.iloc[:, :].sum(                                                     #
            axis=0, skipna=True), ignore_index=True)                                                            #
        #
        sku_data = sku_data.append(                                                                             #
            sku_data.iloc[res_count, :]/(len(sku_data.index)-1))                                                #
        #
        #
        #
        data1['Changed SOP'] = list(
            sku_data.iloc[res_count+1, 0:len(sku_columns)])        #
        #
        #
        return data1.to_json(orient='index')


@app.route("/editsop", methods=['GET', 'POST'])
def editsop():
    if request.method == "GET":
        if request.args.get('value') == None:
            sale_percent = 0
        else:
            sale_percent = request.args.get('value')
        columns = list(data)

        price_columns = [i for i in columns if (
            type(i) is float or type(i) == int)]

        price_data = data.loc[:, data.columns.isin(price_columns)]

        sku_columns = []
        ######################################################################
        for i in columns:                                                    #
            if(i not in price_columns):                                      #
                if(i != 'NONE' and i != 'RLH' and i != 'Respondent'):        #
                    sku_columns.append(i)                                    #
                    #
        sku_data = data.loc[:, data.columns.isin(sku_columns)]               #
        res_count = len(sku_data.index)                                      #
        # Data preparation                                                   #
        #
        for i in range(0, len(sku_columns)):                                 #
            #
            sku_data.iloc[:, i] = np.exp(                                    #
                (sku_data.iloc[:, i] + price_data[float(sale_percent)]))               #
        # change the repondent weight                                        #
        sku_data['sum'] = sku_data.iloc[:, 0:res_count].sum(axis=1)          #
        #
        ######################################################################
        #########################################################################################################
        #
        for index, row in sku_data.iterrows():

            #print(sku_data.iloc[index, :])
            #
            sku_data.iloc[index, :] = row/sku_data['sum'][index]
            #
        sku_data = sku_data.append(sku_data.iloc[:, :].sum(                                                     #
            axis=0, skipna=True), ignore_index=True)                                                            #
        #
        sku_data = sku_data.append(                                                                             #
            sku_data.iloc[res_count, :]/(len(sku_data.index)-1))                                                #
        #
        #
        #
        data1['Changed SOP'] = list(
            sku_data.iloc[res_count+1, 0:len(sku_columns)])      #
        #
        #
        return data1.to_json(orient='records')


@app.route("/getsop", methods=['GET', 'POST'])
def getsop():
    if request.method == "POST":
        global data
        global data1
        data = pd.read_excel(request.files['myFile'])
        # Data preparation
        columns = list(data)

        price_columns = [i for i in columns if (
            type(i) is float or type(i) == int)]

        price_data = data.loc[:, data.columns.isin(price_columns)]

        sku_columns = []
        ######################################################################
        for i in columns:                                                    #
            if(i not in price_columns):                                      #
                if(i != 'NONE' and i != 'RLH' and i != 'Respondent'):        #
                    sku_columns.append(i)                                    #
                    #
        sku_data = data.loc[:, data.columns.isin(sku_columns)]               #
        res_count = len(sku_data.index)                                      #
        # Data preparation                                                   #
        #
        for i in range(0, len(sku_columns)):                                 #
            #
            sku_data.iloc[:, i] = np.exp(                                    #
                (sku_data.iloc[:, i] + price_data[0]))               #
        # change the repondent weight                                        #
        sku_data['sum'] = sku_data.iloc[:, 0:res_count].sum(axis=1)          #
        #
        ######################################################################
        #########################################################################################################
        #
        for index, row in sku_data.iterrows():

            #print(sku_data.iloc[index, :])
            sku_data.iloc[index, :] = row / \
                sku_data['sum'][index]                                  #
            #
        sku_data = sku_data.append(sku_data.iloc[:, :].sum(                                                     #
            axis=0, skipna=True), ignore_index=True)                                                            #
        #
        sku_data = sku_data.append(                                                                             #
            sku_data.iloc[res_count, :]/(len(sku_data.index)-1))                                                #
        #
        #
        #print(list(sku_data.iloc[:, 0:len(sku_columns)].columns.values))
        #
        data1 = pd.DataFrame({'SKUs': list(sku_data.iloc[:, 0:len(                                              #
            sku_columns)].columns.values), 'SOP': list(sku_data.iloc[res_count+1, 0:len(sku_columns)])})        #
        #
        # print(price_columns)
        #
        return data1.to_json(orient='records')
        #########################################################################################################


@app.route("/addstudy", methods=['GET', 'POST'])
def addstudy():
    if request.method == "POST":
        #file = request.files['myFile'].read()
        print(request.files['myFile'])
        data = pd.read_excel(request.files['myFile'])
        print(data)
        #data.to_sql('HBU', engine, if_exists='append')

        return data.to_json()


@app.route("/getstudy", methods=['GET'])
def getstudy():
    if request.method == "GET":
        #file = request.files['myFile'].read()
        data = pd.read_sql('SELECT * FROM SOP', engine)
        print(data)
        return data.to_json(orient='records')


if __name__ == '__main__':
    app.run(debug=True)
