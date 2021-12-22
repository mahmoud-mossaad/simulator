# flask imports
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid  # for public id
from werkzeug.security import generate_password_hash, check_password_hash
# imports for PyJWT authentication
import jwt
from sqlalchemy import create_engine
from datetime import datetime, timedelta
from functools import wraps
from flask_cors import CORS
import pandas as pd
import json
import sys
import timeit

pd.options.mode.chained_assignment = None


# creates Flask object
app = Flask(__name__)
# configuration
# NEVER HARDCODE YOUR CONFIGURATION IN YOUR CODE
# INSTEAD CREATE A .env FILE AND STORE IN IT
engine = create_engine(
    'mysql+pymysql://siood:123456@localhost/mydb')

app.config['SECRET_KEY'] = 'your secret key'
# database name
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://siood:123456@localhost/mydb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
# creates SQLALCHEMY object
db = SQLAlchemy(app)

# Database ORMs
CORS(app)


class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(70), unique=True)
    password = db.Column(db.String(100))

# decorator for verifying the JWT


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, app.config['SECRET_KEY'])
            current_user = User.query\
                .filter_by(public_id=data['public_id'])\
                .first()
        except:
            return jsonify({
                'message': 'Token is invalid !!'
            }), 401
        # returns the current logged in users contex to the routes
        return f(current_user, *args, **kwargs)

    return decorated

# User Database Route
# this route sends back list of users users


@app.route('/user', methods=['GET'])
@token_required
def get_all_users(current_user):
    # querying the database
    # for all the entries in it
    users = User.query.all()
    # converting the query objects
    # to list of jsons
    output = []
    for user in users:
        # appending the user data json
        # to the response list
        output.append({
            'public_id': user.public_id,
            'name': user.name,
            'email': user.email
        })

    return jsonify({'users': output})

# route for logging user in


@app.route('/login', methods=['POST'])
def login():
    # creates dictionary of form data
    auth = request.form
    if not auth or not auth.get('email') or not auth.get('password'):
        # returns 401 if any email or / and password is missing
        return make_response(
            'Could not verify',
            401,
            {'WWW-Authenticate': 'Basic realm ="Login required !!"'}
        )

    user = User.query\
        .filter_by(email=auth.get('email'))\
        .first()

    if not user:
        # returns 401 if user does not exist
        return make_response(
            'Could not verify!',
            401,
            {'WWW-Authenticate': 'Basic realm ="User does not exist !!"'}
        )
    if check_password_hash(user.password, auth.get('password')):
        # generates the JWT Token
        token = jwt.encode({
            'public_id': user.public_id,
            'exp': datetime.utcnow() + timedelta(minutes=10)
        }, app.config['SECRET_KEY'])

        return make_response(jsonify({'token': token.decode('UTF-8')}), 201)
    # returns 403 if password is wrong
    return make_response(
        'Could not verify!!',
        403,
        {'WWW-Authenticate': 'Basic realm ="Wrong Password !!"'}
    )

# signup route


@app.route('/signup', methods=['POST'])
def signup():
    # creates a dictionary of the form data
    data = request.form

    # gets name, email and password
    name, email = data.get('name'), data.get('email')
    password = data.get('password')
    # checking for existing user
    user = User.query\
        .filter_by(email=email)\
        .first()
    if not user:
        # database ORM object
        paswd = generate_password_hash(password, "sha256")
        user = User(
            public_id=str(uuid.uuid4()),
            name=name,
            email=email,
            password=paswd
        )
        # insert user
        db.session.add(user)
        db.session.commit()

        return make_response('Successfully registered.', 201)
    else:
        # returns 202 if user already exists
        return make_response('User already exists. Please Log in.', 202)


def from_list_to_str(val):
    l = val.split()
    if "s" in l:
        return from_str_to_float(l[-1])
    else:
        return (float(l[-1]))


def from_str_to_float(val):
    col = val.split(".")
    col.pop()
    number = ''
    for k in col:
        number = number + k
    return float(number)


def get_average(value, skus, price_columns, price_data):
    price_columns1 = []
    for i in range(0, len(price_columns)):
        if type(price_columns[i]) == str:
            price_columns1.append(from_str_to_float(price_columns[i]))
        else:
            price_columns1.append(price_columns[i])
    new_u = {}
    for v in range(0, len(value)):
        # if the percentage were found we return nothing else we calculate the new percentage with it's data
        if(value[v] in price_columns1):
            new_u[skus[v]
                  ] = price_data[price_columns[price_columns1.index(value[v])]]
        else:
            for i in range(0, len(price_columns)-1):
                if (value[v] > price_columns1[i] and value[v] < price_columns1[i+1]):
                    v1 = price_columns1[i]
                    v2 = price_columns1[i+1]
                    u = price_data[price_columns[i+1]] - ((v2 - value[v]) *
                                                          (price_data[price_columns[i+1]] - price_data[price_columns[i]])/(v2-v1))
                    new_u[skus[v]] = u
# new_u has a dictionary of SKU name and it's corresponding new calculated percentage fromn the HBU file
    return new_u

# A function that returns the new affinity percentage columns from the HBU data
# base_price: Base value price and it's correspoding SKU namne (dict)
# new_price: new price value that've changed in the front-end with it's correspoding SKU name (dict)


def get_percentage(base_price, new_price, price_columns, price_data):

    per = []
# per: shall have the percentage between the base price and the new price ti go back to the hbu file to calculate the affinity
    for i in base_price:
        if base_price[i] != new_price[i]:
            per.append(
                (float(new_price[i])-float(base_price[i]))/float(base_price[i]))
    return get_average(per, list(new_price.keys()), price_columns, price_data)


start = timeit.default_timer()


def calculate_new_sop(hbu, product_list, attribute_list, data):
    for i in range(1, len(list(data.keys()))):
        type = attribute_list.loc[attribute_list['name'] == list(data.keys())[
            i]].iloc[0, 5]
        if type == 0:
            data_changed = data[list(data.keys())[i]]
            data_changed_names = list(data_changed.keys())
            for x in data_changed_names:
                index = product_list.index[product_list['SKU Name'] == " ".join(x.split())].tolist()[
                    0]
                product_list.at[index, 'Base ' +
                                list(data.keys())[i]] = data_changed[x]
        if type == 1:
            data_changed = data[list(data.keys())[i]]
            data_changed_names = list(data_changed.keys())
            for x in data_changed_names:
                index = product_list.index[product_list['SKU Name'] == " ".join(x.split())].tolist()[
                    0]
                product_list.at[index, 'New ' +
                                list(data.keys())[i]] = data_changed[x]
    sku_names = list(product_list['SKU Name'])
    attr = []
    for i in list(product_list):
        if "Base " in i:
            attr.append(i)

    sop_per_sku = {}
    start = timeit.default_timer()
    for i in sku_names:
        calculated = hbu.loc[:, i]
        for x in attr:
            if attribute_list.loc[attribute_list['name'] == x.replace("Base ", "")].iloc[0, 5] == 0:
                calculated = calculated + \
                    hbu.loc[:, list(
                        product_list.loc[product_list['SKU Name'] == i, x])[0]]
        sop_per_sku[i] = calculated
    # print(sop_per_sku)
    stop = timeit.default_timer()
    print('Time: ', stop - start)
    for x in attr:
        if attribute_list.loc[attribute_list['name'] == x.replace("Base ", "")].iloc[0, 5] == 1:
            per = []
            for i in range(0, len(sku_names)):
                per.append((product_list[x.replace("Base", "New")][i]-product_list[x.replace(
                    "Base", "Zero")][i])/product_list[x.replace("Base", "Zero")][i])
            start_level = attribute_list.loc[attribute_list['name'] == x.replace(
                "Base ", "")].iloc[0, 3]
            end_level = attribute_list.loc[attribute_list['name'] == x.replace(
                "Base ", "")].iloc[0, 4]

            price_columns = [from_list_to_str(i) for i in list(
                hbu.iloc[:, start_level+1:end_level+1])]
            old_colnames = list(hbu.iloc[:, start_level+1:end_level+1])
            col_rename_dict = {i: j for i, j in zip(
                old_colnames, price_columns)}
            hbu1 = hbu

            hbu1.rename(columns=col_rename_dict, inplace=True)
            new_u = get_average(per, sku_names, price_columns,
                                hbu1.iloc[:, start_level+1:end_level+1])
            for i in list(sop_per_sku):
                sop_per_sku[i] = sop_per_sku[i]+new_u[i]
    sop_per_sku = pd.DataFrame.from_dict(sop_per_sku)
    sku_data = sop_per_sku

    for i in range(0, len(sku_names)):
        sku_data.iloc[:, i] = np.exp(
            sku_data.iloc[:, i])*list(product_list['Market Share'])[i]

    sku_data['sum'] = sku_data.iloc[:, 0:sku_data.shape[0]].sum(axis=1)

    start = timeit.default_timer()
    for index, row in sku_data.iterrows():
        sku_data.iloc[index, :] = row/sku_data['sum'][index]
    stop = timeit.default_timer()
    print('Time: ', stop - start)
    sku_data = sku_data.append(sku_data.iloc[:, :].sum(
        axis=0, skipna=True), ignore_index=True)

    sku_data = sku_data.append(
        sku_data.iloc[-1:]/(len(sku_data.index)-1))

    sku_data = sku_data[sku_data.columns[:-1]]
    product_list['Changed_SOP'] = sku_data.iloc[-1:].values[0]
    product_list.drop('index', axis=1, inplace=True)
    product_list.to_sql(
        'data'+data['name']+'edited', engine, if_exists='replace')
    # data1.to_excel("output.xlsx")

# returning a data of SKUs, SOPs, changed_sop, base_price, new_price
    return product_list.to_json(orient='records')


# Below is the api to handle the changeed SOP when recieveing a list of new price variables
@app.route("/editsopbyvalue", methods=['GET', 'POST'])
def editsopbyvalue():
    if request.method == "POST":
        data = request.data
        data = json.loads(data.decode('utf-8'))
        hbu_sql = (f"SELECT * "
                   f"FROM `hbu{data['name']}` ")
        product_list_sql = (f"SELECT * "
                            f"FROM `data{data['name']}edited` ")
        attribute_list_sql = (f"SELECT * "
                              f"FROM `attributes` "
                              f"WHERE projectName = '{data['name']}';")

        hbu = pd.read_sql(
            hbu_sql, engine)
        product_list = pd.read_sql(
            product_list_sql, engine)
        attribute_list = pd.read_sql(attribute_list_sql, engine)

        return calculate_new_sop(hbu, product_list, attribute_list, data)


@ app.route("/getsop", methods=['GET', 'POST'])
def getsop():
    if request.method == "POST":

        start = timeit.default_timer()

        design_file = pd.read_excel(
            request.files['myFile1'], None)
        hbu = pd.read_excel(
            request.files['myFile'])

        attr_sheet_names = []

        for i in range(0, len(list(design_file['Attributes']['Attribute Name']))):
            if (list(design_file['Attributes']['Attribute Name'])[i] + ' Attribute Levels') in list(design_file.keys()):
                attr_sheet_names.append(list(design_file['Attributes']['Attribute Name'])[
                    i] + ' Attribute Levels')

        product_list = design_file['Product List']

        first_sku = 2
        end_sku = 2
        end_sku1 = 0
        attr = []

        for i in design_file['Attributes'].to_dict('records'):
            if i['Attribute Name'] == 'SKU':
                end_sku += i['Levels Count']
                end_sku1 = end_sku
            else:
                if i['Discrete Type'] == 0:
                    attr.append({'name': i['Attribute Name'],
                                'start_level': end_sku,
                                 'end_level': end_sku+i['Levels Count'],
                                 'type': 1})
                    end_sku += i['Levels Count']
                else:
                    attr.append({'name': i['Attribute Name'],
                                'start_level': end_sku,
                                 'end_level': end_sku+i['Levels Count'],
                                 'type': 0})
                    end_sku += i['Levels Count']

        for i in range(0, len(attr)):
            attr[i]['sheet_name'] = attr_sheet_names[i]

        for i in attr:
            if i['type'] == 1:
                zero_data = design_file[i['sheet_name']][design_file[i['sheet_name']].iloc[[
                    0]].apply(lambda row: row[row == 0].index, axis=1)[0]].drop([0])
                zero_data = zero_data[list(zero_data)[0]].to_list()
                i['Base '+i['name']] = zero_data
            else:
                data_list = design_file[i['sheet_name']].iloc[0, :].to_list()
                data_list = [x for x in data_list if x == x]
                del data_list[0]
                i['data'] = {}
                for x in range(0, len(data_list)):
                    i['data'][data_list[x]] = i['start_level']+x
        sku_names = product_list['SKU Name'].to_list()
        sku_names = [x for x in sku_names if x == x]
        market_share = list(product_list['Market Share'])
        market_share = [x for x in market_share if x == x]

        for i in range(0, len(sku_names)):
            sku_names[i] = " ".join(sku_names[i].split())

        for i in range(0, len(market_share)):
            if market_share[i] > 0.01:
                market_share[i] = 1
            else:
                market_share[i] = 0

        sku_hbu_columns = {}

        for i in range(2, end_sku1):
            sku_hbu_columns[sku_names[i-2]] = i

        sku_base_data = []
        base_data_column_names = []
        for i in attr:
            base_data_column_names.append('Base '+i['name'])

        base_data_column_names.append('SKU Name')
        product_list = product_list[:end_sku1-2].loc[:,
                                                     base_data_column_names]
        product_list['SKU Name'] = sku_names

        sku_base_data = product_list.to_dict('records')
        #####################################################################
        sop_per_sku = {}

        for i in sku_base_data:
            # print(hbu.iloc[:, sku_hbu_columns[i['SKU Name']]])
            calculated = hbu.iloc[:, sku_hbu_columns[i['SKU Name']]]
            # print(calculated)
            for x in attr:
                if i['Base '+x['name']]:
                    if x['type'] == 0:
                        calculated = calculated + \
                            hbu.iloc[:, x['data'][i['Base '+x['name']]]]
            sop_per_sku[i['SKU Name']] = calculated

        for x in attr:
            if x['type'] == 1:
                per = []
                for i in range(0, end_sku1-2):
                    if sku_base_data[i]['Base '+x['name']]:

                        per.append((float(sku_base_data[i]['Base '+x['name']])-float(
                            x['Base '+x['name']][i]))/float(x['Base '+x['name']][i]))
                new_u = get_average(per, sku_names, list(
                    hbu.iloc[:, x['start_level']:x['end_level']]), hbu.iloc[:, x['start_level']:x['end_level']])
                for i in list(sop_per_sku):
                    sop_per_sku[i] = sop_per_sku[i]+new_u[i]

        sop_per_sku = pd.DataFrame.from_dict(sop_per_sku)

        sku_data = sop_per_sku

        for i in range(0, len(sku_names)):
            sku_data.iloc[:, i] = np.exp(
                sku_data.iloc[:, i])*market_share[i]

        sku_data['sum'] = sku_data.iloc[:, 0:sku_data.shape[0]].sum(axis=1)

        for index, row in sku_data.iterrows():
            sku_data.iloc[index, :] = row/sku_data['sum'][index]
        sku_data = sku_data.append(sku_data.iloc[:, :].sum(
            axis=0, skipna=True), ignore_index=True)

        sku_data = sku_data.append(
            sku_data.iloc[-1:]/(len(sku_data.index)-1))

        sku_data = sku_data[sku_data.columns[:-1]]

        project_name = list(design_file['Description'])[1].lower()

        data1 = pd.DataFrame(
            {'SKUs': sku_names, 'SOP': sku_data.iloc[-1:].values[0]*100})

        stop = timeit.default_timer()

        print('Time: ', stop - start)
        #print(data1)      #
        #
        # print(price_columns)
        #

        old_colnames = list(hbu.iloc[:, first_sku:end_sku1])
        col_rename_dict = {i: j for i, j in zip(old_colnames, sku_names)}

        hbu.rename(columns=col_rename_dict, inplace=True)

        for i in attr:
            old_colnames = list(hbu.iloc[:, i['start_level']:i['end_level']])
            if i['type'] == 0:
                col_rename_dict = {i: j for i, j in zip(
                    old_colnames, list(i['data'].keys()))}
                hbu.rename(columns=col_rename_dict, inplace=True)
            if i['type'] == 1:
                new_colnames = []
                for x in old_colnames:
                    if type(x) == str:
                        new_colnames.append(i['name'] + " s " + str(x))
                    else:
                        new_colnames.append(i['name'] + " " + str(x))
                col_rename_dict = {i: j for i, j in zip(
                    old_colnames, new_colnames)}
                hbu.rename(columns=col_rename_dict, inplace=True)
        rendered_data = product_list[:end_sku1 -
                                     2].loc[:, base_data_column_names]
        for i in attr:
            if i['type'] == 1:
                rendered_data['New '+i['name']
                              ] = rendered_data['Base '+i['name']]
                rendered_data['Zero '+i['name']] = i['Base '+i['name']]
        rendered_data['Market Share'] = market_share
        rendered_data['SOP'] = sku_data.iloc[-1:].values[0]
        for i in list(design_file['Product List']):
            if 'Group' in i:
                rendered_data[i.split()[-1]] = design_file['Product List'][i]
        rendered_data['Changed_SOP'] = sku_data.iloc[-1:].values[0]
        project = pd.DataFrame({'name': [project_name], 'dataName': ['data'+list(
            design_file['Description'])[1]], 'hbuName': ['hbu'+project_name]})

        attribute_names = []
        attribute_start_level = []
        attribute_end_level = []
        attribute_type = []
        attribute_project = []
        attribute_data_name = []

        attribute_hbu_name = []
        for i in attr:
            attribute_names.append(i['name'])
            attribute_start_level.append(i['start_level'])
            attribute_end_level.append(i['end_level'])
            attribute_type.append(i['type'])
            attribute_project.append(project_name)
            attribute_data_name.append(
                'data'+project_name)
            attribute_hbu_name.append(
                'hbu'+project_name)

        attributes = pd.DataFrame({'name': attribute_names, 'firstCol': attribute_start_level, 'lastCol': attribute_end_level,
                                  'type': attribute_type, 'projectName': attribute_project, 'dataName': attribute_data_name, 'hbuName': attribute_hbu_name})
        start = timeit.default_timer()

        attributes.to_sql('attributes', engine, if_exists='append')

        try:
            project.to_sql('projects', engine, if_exists='append')
        except Exception:
            exc_type, value, traceback = sys.exc_info()
            print(exc_type, value)
        try:
            rendered_data.to_sql(
                'data'+project_name, engine, if_exists='replace')
            rendered_data.to_sql(
                'data'+project_name+'edited', engine, if_exists='replace')
        except:
            exc_type, value, traceback = sys.exc_info()
            print(exc_type, value)
        try:
            hbu.to_sql(
                'hbu'+project_name, engine, if_exists='replace')
        except:
            exc_type, value, traceback = sys.exc_info()
            print(exc_type, value)

        stop = timeit.default_timer()

        print('Time: ', stop - start)
        data1.to_excel("output.xlsx")
        output = {}
        output['data'] = rendered_data.to_dict('records')
        output['name'] = project_name
        output['type'] = []
        output['options'] = []
        output['group'] = []
        for i in list(design_file['Product List']):
            if 'Group' in i:
                output['group'].append(
                    {"key": i.split()[-1], "text": i.split()[-1], "value": i.split()[-1]})
        for i in attr:
            output['type'].append({i['name']: i['type']})
            if i['type'] == 0:
                output['options'].append({i['name']: i['data']})
        return json.dumps(output)
        #########################################################################################################


@ app.route("/uploadscenario", methods=['GET', 'POST'])
def uploadscenario():
    if request.method == "POST":

        start = timeit.default_timer()

        scenario = pd.read_excel(
            request.files['myFile'], None)
        data = request.form.to_dict()
        scenarios = []
        for x in range(1, len(list(scenario[list(scenario)[0]]))):
            scenarios.append({"key": list(scenario[list(scenario)[0]])[x], "text": list(
                scenario[list(scenario)[0]])[x], "value": list(scenario[list(scenario)[0]])[x]})
            data[list(scenario[list(scenario)[0]])[x]] = {}
            data[list(scenario[list(scenario)[0]])[x]]['name'] = data['name']
            for i in list(scenario):
                data[list(scenario[list(scenario)[0]])[x]][i] = {}
                data[list(scenario[list(scenario)[0]])[x]][i] = dict(
                    zip(list(scenario[i].iloc[:, 0]), list(scenario[i].iloc[:, x])))

        for i in data.keys():
            if i != 'name':
                scenario_upload = data[i]
                scenario_upload = pd.DataFrame.from_dict(scenario_upload)
                scenario_upload.reset_index(inplace=True)
                scenario_upload.rename(
                    columns={'index': 'SKU Name'}, inplace=True)
                try:
                    scenario_upload.to_sql(
                        data['name']+i, engine, if_exists='replace')
                except:
                    exc_type, value, traceback = sys.exc_info()
                    print(exc_type, value)

        hbu_sql = (f"SELECT * "
                   f"FROM `hbu{data['name']}` ")
        product_list_sql = (f"SELECT * "
                            f"FROM `data{data['name']}edited` ")
        attribute_list_sql = (f"SELECT * "
                              f"FROM `attributes` "
                              f"WHERE projectName = '{data['name']}';")

        hbu = pd.read_sql(
            hbu_sql, engine)
        product_list = pd.read_sql(
            product_list_sql, engine)
        attribute_list = pd.read_sql(attribute_list_sql, engine)
        #print(list(scenario['Price'].iloc[:, 0]))
        stop = timeit.default_timer()

        print('Time: ', stop - start)
        print(attribute_list)
        output = json.loads(calculate_new_sop(
            hbu, product_list, attribute_list, data[list(data.keys())[1]]))
        return json.dumps([output, {"scenarios": scenarios}])


@ app.route("/setscenario", methods=['GET', 'POST'])
def setscenario():
    if request.method == "GET":
        # file = request.files['myFile'].read()
        name = request.args.get('name')
        scenario = request.args.get('scenario')
        hbu_sql = (f"SELECT * "
                   f"FROM `hbu{name}` ")
        product_list_sql = (f"SELECT * "
                            f"FROM `data{name}edited` ")
        attribute_list_sql = (f"SELECT * "
                              f"FROM `attributes` "
                              f"WHERE projectName = '{name}';")
        scenario_sql = (f"SELECT * "
                        f"FROM `{name}{scenario}` ")

        hbu = pd.read_sql(
            hbu_sql, engine)
        product_list = pd.read_sql(
            product_list_sql, engine)
        attribute_list = pd.read_sql(attribute_list_sql, engine)

        scenario = pd.read_sql(scenario_sql, engine)
        scenario.drop(columns=['index', 'name'], inplace=True)
        scenario.set_index('SKU Name', inplace=True)
        scenario = scenario.to_dict()
        scenario = dict({'name': name}, **scenario)
        return calculate_new_sop(hbu, product_list, attribute_list, scenario)


@ app.route("/savescenario", methods=['GET', 'POST'])
def savescenario():
    if request.method == "POST":
        data = request.data
        data = json.loads(data.decode('utf-8'))
        print(data)
        return "1"


@ app.route("/restoredefault", methods=['GET', 'POST'])
def restoredefault():
    if request.method == "GET":
        # file = request.files['myFile'].read()
        name = request.args.get('name')

        product_list_sql = (f"SELECT * "
                            f"FROM `data{name}` ")

        product_list = pd.read_sql(
            product_list_sql, engine)

        product_list.to_sql(
            'data'+name+'edited', engine, if_exists='replace')
        return product_list.to_json(orient='records')


@ app.route("/getstudy", methods=['GET'])
def getstudy():
    if request.method == "GET":
        data = pd.read_sql('SELECT * FROM SOP', engine)
        print(data)
        return data.to_json(orient='records')


if __name__ == "__main__":
    # setting debug to True enables hot reload
    # and also provides a debuger shell
    # if you hit an error while running the server
    app.run(debug=True)
