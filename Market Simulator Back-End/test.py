import timeit
import pandas as pd
import math
import numpy as np
pd.options.mode.chained_assignment = None


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


# Your statements here
start = timeit.default_timer()


data = pd.read_excel(
    'E:\Marketeers\Market Simulator Back-End\HBU.xlsx')


# Data preparation
columns = list(data)

price_columns = [i for i in columns if (type(i) is float or type(i) == int)]

price_data = data.loc[:, data.columns.isin(price_columns)]

price = get_average(0.33, price_columns=price_columns, price_data=price_data)


sku_columns = []


######################################################################
for i in columns:                                                    #
    if(i not in price_columns):
        if(i != 'NONE' and i != 'RLH' and i != 'Respondent'):
            sku_columns.append(i)

sku_data = data.loc[:, data.columns.isin(sku_columns)]
res_count = len(sku_data.index)
# print(res_count)
# Data preparation

for i in range(0, len(sku_columns)):

    sku_data.iloc[:, i] = np.exp(
        (sku_data.iloc[:, i] + price))
# change the repondent weight
sku_data['sum'] = sku_data.iloc[:, 0:res_count].sum(axis=1)

##################################################################


# Put the code cut in here


for index, row in sku_data.iterrows():

    #print(sku_data.iloc[index, :])

    sku_data.iloc[index, :] = row/sku_data['sum'][index]

stop = timeit.default_timer()


sku_data = sku_data.append(sku_data.iloc[:, :].sum(
    axis=0, skipna=True), ignore_index=True)

sku_data = sku_data.append(sku_data.iloc[res_count, :]/(len(sku_data.index)-1))

# print(sku_data)
#print(list(sku_data.iloc[:, 0:len(sku_columns)].columns.values))

data1 = pd.DataFrame({'SKUs': list(sku_data.iloc[:, 0:len(
    sku_columns)].columns.values), 'SOP': list(sku_data.iloc[res_count+1, 0:len(sku_columns)])})


# print(data1)
# print(data.iloc[:, 2:86].sum(axis=0, skipna=True))
# data1 = data.iloc[:, 2:86].sum(axis=0, skipna=True)
# data = pd.concat(data.iloc[:, 2:86], data1, ignore_index=True, axis=0)

#    print("hello")
# print(data.iloc[804, 2:86])
data1.to_excel("output.xlsx")

print('Time: ', stop - start)
