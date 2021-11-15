import pandas as pd
import math
import numpy as np


data = pd.read_excel(
    'E:\Marketeers\Market Simulator Back-End\HBU.xlsx')

columns = list(data)

price_columns = [i for i in columns if (type(i) is float or type(i) == int)]

price_data = data.loc[:, data.columns.isin(price_columns)]

sku_columns = []

for i in columns:
    if(i not in price_columns):
        if(i != 'NONE' and i != 'RLH' and i != 'Respondent'):
            sku_columns.append(i)

sku_data = data.loc[:, data.columns.isin(sku_columns)]

# print(sku_data)
print(len(sku_data.index))

#columns = [ele for ele in columns if ele not in price_columns]
# columns = [ele for ele in columns if ele !=
#          'NONE' or ele != 'RLH' or ele != 'Respondent']

# print(columns)

#print([k for k in columns if 'RLH' in k])


# print(price_data)

# print(data.select_dtypes([np.number]).columns)
# print(data.dtypes)

#price_Data = data.drop
# df[df.columns[df.columns.isin()]]


# print(list(data))
for i in range(0, 805):

    data.iloc[i, :] = data.iloc[i, :]/data['sum'][i]


data = data.append(data.iloc[:, :].sum(axis=0, skipna=True), ignore_index=True)

data = data.append(data.iloc[805, :]/(len(data.index)-1))


print(list(data.iloc[:, 2:86].columns.values))
print(list(data.iloc[805, 2:86]))

data1 = pd.DataFrame({'SKUs': list(
    data.iloc[:, 2:87].columns.values), 'SOP': list(data.iloc[806, 2:87])})

print(data1)
# print(data.iloc[:, 2:86].sum(axis=0, skipna=True))
# data1 = data.iloc[:, 2:86].sum(axis=0, skipna=True)
# data = pd.concat(data.iloc[:, 2:86], data1, ignore_index=True, axis=0)

#    print("hello")
# print(data.iloc[804, 2:86])
data1.to_excel("output.xlsx")
