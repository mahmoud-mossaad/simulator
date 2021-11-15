for i in range(0, res_count):

    sku_data.iloc[i, :] = sku_data.iloc[i, :]/sku_data['sum'][i]


sku_data = sku_data.append(sku_data.iloc[:, :].sum(
    axis=0, skipna=True), ignore_index=True)

sku_data = sku_data.append(sku_data.iloc[res_count, :]/(len(sku_data.index)-1))

print(sku_data)
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
