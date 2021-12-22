import React from "react";
import { defineCustomElements} from "@revolist/revogrid/loader";
import { RevoGrid } from "@revolist/revogrid-react";
import axios from 'axios';
import "./styles.css";
import "./yarab.css";
import 'react-dropdown/style.css';
import NumberColumnType from '@revolist/revogrid-column-numeral';
import SelectTypePlugin from "@revolist/revogrid-column-select";
import { Container, Grid, Dropdown, Button, Icon } from "semantic-ui-react";
import { getToken } from '../../../../Utils/Common';



export default class GridSimulator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectname:'',
      options: [],
      type: [],
      files: [],
      isUploading: false,
      isFetching: false,
      currentGroup: "",
      groups: [],
      scenarios: [],
      currentscenario: "",
      grouping: {},
      companyName: "",
      columns1: [
        {
          prop: "Brand",
          name: "Name",
        },
        {
          prop: "SOP",
          name: "Base SOP",
          columnType: 'two'
        },
        {
          prop: "Changed_SOP",
          name: "New SOP",
          columnType: 'two',
          cellProperties: ({prop, model, data, column}) => {
                
            if(this.increased.includes(model['Brand']))
            {
            return {
              style: {
                color: 'green'
              },
              class: {
                'bank': true
              }
            };
          }
          if(this.decreased.includes(model['Brand']))
          {
          return {
            style: {
              color: 'red'
            },
            class: {
              'bank': true
            }
          };
        }
        
        },
        }
      ],
      columns: [
        {
          pin: "colPinStart",
          size: 50,
          readonly: "true",
          // defining checkbox template
          cellTemplate: (createElement, props) => {
            props.model["checked"] = props.model["Market Share"];
            const input = createElement("input", {
              type: "checkbox",
              // store is selected in rows "checked" prop
              checked: props.model["checked"],
              onChange(e) {
                console.log(e.target)
                props.model["Market Share"] = e.target.checked
                props.model["checked"] = e.target.checked;
                const data = {}
                if (input) {
                  input.$attrs$.checked = e.target.checked;
                }
              }
            });
            return input;
          }
        },
        {
          prop: "SKU Name",
          name: "SKUs",
          readonly: "true",
          pin: "colPinStart",
          autoSizeColumn: "true"
  
        },
        {
              prop: "SOP",
              name: "Base SOP",
              columnType: 'seven',
              readonly:'true',
              pin: "colPinStart",
              autoSizeColumn: "true"
          
        },
        {
              prop: "Changed_SOP",
              name: "New SOP",
              readonly:'true',
              pin: "colPinStart",
              columnType: 'eight',
              autoSizeColumn: "true",
              cellProperties: ({prop, model, data, column}) => {
                
                if(this.increased.includes(model['SKU Name']))
                {
                return {
                  style: {
                    color: 'green'
                  },
                  class: {
                    'bank': true
                  }
                };
              }
              if(this.decreased.includes(model['SKU Name']))
              {
              return {
                style: {
                  color: 'red'
                },
                class: {
                  'bank': true
                }
              };
            }
            
            },},
      ],
      rowData: [],
      rowData1: []
    }
    this.afterEdit = this.afterEdit.bind(this);
    defineCustomElements();
    this.file = ''
    this.filename = ''
    this.file1 = ''
    this.filename1 = ''
    this.file2 = ''
    this.filename2 = ''
    this.columnTypes = {
      'one': new NumberColumnType('0.0%'),
      'two': new NumberColumnType('0.00%'),
      'three': new NumberColumnType('0.000%'),
      'four': new NumberColumnType('0.0000%'),
      'five': new NumberColumnType('0.00000%'),
      'six': new NumberColumnType('0.000000%'),
      'seven': new NumberColumnType('0.0000000%'),
      'eight': new NumberColumnType('0.00000000%'),
      'select': new SelectTypePlugin() 
    }
    this.increased=[]
    this.decreased=[]
    this.currentlySeleced = {};
    this.initial_columns = [
      {
        pin: "colPinStart",
        size: 50,
        readonly: "true",
        // defining checkbox template
        cellTemplate: (createElement, props) => {
          props.model["checked"] = props.model["Market Share"];
          const input = createElement("input", {
            type: "checkbox",
            // store is selected in rows "checked" prop
            checked: props.model["checked"],
             onChange: (e) => {
              console.log(props)
              props.model["Market Share"] = e.target.checked
              props.model["checked"] = e.target.checked;
              const data = {}
              data['name'] = this.state.projectname
              data['SKU'] = props.model['SKU Name']
              data['check'] = props.model["checked"]
              this.ChangedSOPRequest(data)
              if (input) {
                input.$attrs$.checked = e.target.checked;
              }
            }
          });
          return input;
        }
      },
      {
        prop: "SKU Name",
        name: "SKUs",
        readonly: "true",
        pin: 'colPinStart',
        autoSizeColumn: "true"

      },
      {
            prop: "SOP",
            name: "Base SOP",
            columnType: 'seven',
            readonly:'true',
            autoSizeColumn: "true"
        
      },
      {
            prop: "Changed_SOP",
            name: "New SOP",
            readonly:'true',
            columnType: 'eight',
            autoSizeColumn: "true",
            cellProperties: ({prop, model, data, column}) => {
              
              if(this.increased.includes(model['SKU Name']))
              {
              return {
                style: {
                  color: 'green'
                },
                class: {
                  'bank': true
                }
              };
            }
            if(this.decreased.includes(model['SKU Name']))
            {
            return {
              style: {
                color: 'red'
              },
              class: {
                'bank': true
              }
            };
          }
          
          },},]
  
    ;
  }
  onSelectItem(row){
  if (row["checked"]) {
    this.currentlySeleced[row.id] = true;
  } else {
    delete this.currentlySeleced[row.id];
  }
  const ids = [];
  for (let i in this.currentlySeleced) {
    ids.push(i);
  }
}
  sumForCompany(data){
    let summedBaseSOP = 0
    let summedNewSOP = 0
    for (const i in data) {
      if(data[i].Company == 1){
        summedBaseSOP += data[i].SOP
        summedNewSOP += data[i].Changed_SOP
      }
  }
  this.setState(prevState => ({
    rowData1: [...prevState.rowData1, { Brand: this.state.companyName, SOP: summedBaseSOP, Changed_SOP: summedNewSOP}]
  }))
}

  handleSummary(group, data){
    let grouped = [];
    data.forEach(function (o) {
        if (!this[o[group]]) {
            this[o[group]] = { Brand: o[group], SOP: 0, Changed_SOP: 0 };
            grouped.push(this[o[group]]);
        }
        this[o[group]].SOP += o.SOP;
        this[o[group]].Changed_SOP += o.Changed_SOP
    }, Object.create(null));
    console.log(grouped)
    this.setState({
      rowData1: grouped
    })
    this.sumForCompany(data)
    this.handleChangedSOP()
  }

  setScenario(e, {value}){
    this.setState({
      isFetching: true,
      currentscenario: value
    })
    axios.get("http://127.0.0.1:5000/setscenario", {params: {
      name:this.state.projectname,
      scenario:value
    }})
    .then((res) => {
      this.setState({rowData :
        Object.values(res.data)
      }
      )
      this.handleChangedSOP();
      this.handleSummary(this.state.currentGroup, Object.values(res.data))
      this.setState({
        isFetching: false
      })
      this.props.onChangeData({'rowData':this.state.rowData, 'scenario': this.state.currentscenario})
    })
  }

  handleBrowse2(e){
    this.file2 = e.target.files[0]
    this.filename2 = e.target.files[0].name
  }

 UpdateColumns(data){
    let cs = [...this.initial_columns];
    let c={}
    let d = []
    for (const key in data['type']){
      if(Object.values(data['type'][key])[0] === 0){
        for (const i in data['options']){
          if(Object.keys(data['type'][key])[0] === Object.keys(data['options'][i])[0]){
            d.push({prop: "Base ".concat(Object.keys(data['type'][key])[0]),
            name: Object.keys(data['type'][key])[0],
            options: Object.keys(Object.values(data['options'][i])[0])})
          }
        }
      }
      if(Object.values(data['type'][key])[0] === 1){
        d.push({
          prop: "Base ".concat(Object.keys(data['type'][key])[0]),
          name: "Base ".concat(Object.keys(data['type'][key])[0]),
          columnType: 'three',
          readonly: "true",
        })
        d.push({
          prop: "New ".concat(Object.keys(data['type'][key])[0]),
          name: "New ".concat(Object.keys(data['type'][key])[0]),
          columnType: 'three'
        })
      }
    }
    for (let i = 0; i < d.length; i++) {
      if(d[i].options!=null){
        c={     
          prop: d[i].prop,
          name: d[i].name,
          source:d[i].options,
          columnType: 'select',
          autoSizeColumn: "true"
        }
      }
      else{
        c={     
          prop: d[i].prop,
          name: d[i].name,
          autoSizeColumn: "true"
        }  
      }
      cs.push(c)
      }
    this.setState({columns:cs})
  }
    
  
  
  afterEdit(event) {
    this.SKUs=[]
    let changed= ''
    let changed1 = ''
    const data = {}
    data['name'] = this.state.projectname
    if(event.detail.prop===undefined){
      for (const key in event.detail.data){
        let a=Object.keys(event.detail.data[key])
        changed = a[0]
      }
      changed1 = changed.replace('Base ', '')
      changed1 = changed1.replace('New ', '')
      data[changed1] = {}
      for (const key in event.detail.data) {
        const skuname=`${event.detail.models[key]['SKU Name']}`
        const value=`${event.detail.data[key][changed]}` 
        data[changed1][skuname] = value
      }
      this.ChangedSOPRequest(data)
      }
    else{
     const changed=event.detail.prop
     changed1 = changed.replace('Base ', '')
     changed1 = changed1.replace('New ', '')
     const value=event.detail.val
     const skuname= event.detail.model['SKU Name']
     this.SKUs.push(skuname)
     const data = {}
     data['name'] = this.state.projectname
     data[changed1] = {}
     data[changed1][skuname] = value
     this.ChangedSOPRequest(data)
    }
    
  }

  

  restoreDefault(e){
    axios.get("http://127.0.0.1:5000/restoredefault", {params: {
      name:this.state.projectname
    }})
    .then((res) => {
      this.setState({rowData :
        Object.values(res.data)
      }
      )

      this.handleChangedSOP();
      this.handleSummary(this.state.currentGroup, Object.values(res.data))
      this.props.onChangeData({'rowData':this.state.rowData, 'scenario': this.state.currentscenario})
    })
  }
 
  ChangedSOPRequest(data){
    axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/editsopbyvalue',
        headers: { 
          'x-access-token': getToken()
        },
        data : data
      })
      .then((res) => {
        this.setState({rowData :
            Object.values(res.data)
          }
          )
        console.log(Object.values(res.data))
        this.handleSummary(this.state.currentGroup, Object.values(res.data))
        this.handleChangedSOP();
        this.props.onChangeData({'rowData':this.state.rowData, 'scenario': this.state.currentscenario})
        } 
        )
  }

      handleChangedSOP(){
        this.increased=[]
        this.decreased=[]
        for (var i = 0; i < this.state.rowData.length; i++) {
          if(this.state.rowData[i].SOP>this.state.rowData[i].Changed_SOP){
           this.decreased.push(this.state.rowData[i]['SKU Name'])
          }
          else{ if(this.state.rowData[i].SOP<this.state.rowData[i].Changed_SOP){
            this.increased.push(this.state.rowData[i]['SKU Name'])
          }
          }
        }
        for(var i = 0; i < this.state.rowData1.length; i++) {
          if(this.state.rowData1[i].SOP>this.state.rowData1[i].Changed_SOP){
            this.decreased.push(this.state.rowData1[i]['Brand'])
           }
           else{ if(this.state.rowData1[i].SOP<this.state.rowData1[i].Changed_SOP){
             this.increased.push(this.state.rowData1[i]['Brand'])
           }
           }
      }
      }
      handlegroups(e, {value}){
        this.state.currentGroup = value
        this.handleSummary(this.state.currentGroup, this.state.rowData)
        this.setState({
          grouping: {
            props: [value],
            expandedAll: true,
          }
        })
      }

      handleMore(e){
        let cs = [...this.state.columns];
        let c={...cs[1]};
        
        switch(c.columnType) {
          case 'one':
            c.columnType='two';break;
          case 'two':
            c.columnType='three';break;
          case 'three':
            c.columnType="four";break;
          case 'four':
            c.columnType="five";break;
          case 'five':
            c.columnType='six';break;
          case 'six':
            c.columnType="seven";break;
          case 'seven':
            c.columnType="eight";break;

        }
        cs[1]=c
        this.setState({columns:cs})
      }

      handleLess(e){
        let cs = [...this.state.columns];
        let c={...cs[1]};
        
        switch(c.columnType) {
          case 'two':
            c.columnType='one';break;
          case 'three':
            c.columnType="two";break;
          case 'four':
            c.columnType="three";break;
          case 'five':
            c.columnType="four";break;
          case 'six':
            c.columnType="five";break;
          case 'seven':
            c.columnType="six";break;
          case 'eight':
            c.columnType="seven";break;
        }
        cs[1]=c
        this.setState({columns:cs})
      
      }
      onDrop = (files) => {
        this.setState({files})
      };

      componentWillReceiveProps(newProps) {
        this.setState({
          rowData: newProps.props.rowData,
          groups:newProps.props.groups,
          currentGroup: newProps.props.currentGroup,
          type: newProps.props.type,
          options: newProps.props.options,
          scenarios: newProps.props.scenarios,
          companyName: newProps.props.companyName,
          currentscenario: newProps.props.currentscenario});
          this.handleSummary(newProps.props.currentGroup, newProps.props.rowData)
          this.setState({
            projectname: newProps.props.projectname,
            grouping: {
              props: [newProps.props.currentGroup],
              expandedAll: true,
            }
          })
          this.UpdateColumns({'type': newProps.props.type, 'options': newProps.props.options});

        this.handleChangedSOP();
    }

  render() {
    return (
      <div  > 
        <Container >
            <Container>
            <Button.Group>
              <Button
               animated
               size='mini'
               icon
               onClick={this.handleLess.bind(this)}
               negative
               disabled={!this.state.isUploading}>
                 <Button.Content visible> Remove</Button.Content>
                 <Button.Content hidden>
                   <Icon name='minus' />
                 </Button.Content>
              </Button>
              <Button.Or />
              <Button
               animated
               size='mini'
               icon
               onClick={this.handleMore.bind(this)}
               positive
               disabled={!this.state.isUploading}>
                 <Button.Content visible> Add</Button.Content>
                 <Button.Content hidden>
                   <Icon name='plus' />
                 </Button.Content>
              </Button>
            </Button.Group>
            
            <div>
            <Button
            variant="contained"
            color="blue"
            onClick={this.restoreDefault.bind(this)}
            value="handle upload"
            style= {{padding:10}}>
            Default Scenario
            </Button>
            </div>
            <Dropdown
            fluid
            selection
            options={this.state.groups}
            value={this.state.currentGroup}
            placeholder='Select Group'
            onChange={this.handlegroups.bind(this)}
          />
            <div>
            </div>
            <Dropdown
            fluid
            selection
            options={this.state.scenarios}
            value={this.state.currentscenario}
            placeholder='Select Scenario'
            onChange={this.setScenario.bind(this)}
            disabled={this.state.isFetching}
            loading={this.state.isFetching}
          />
            <h1>Simulator</h1>
            <Grid columns='equal'>
            <Grid.Column width={10}>
            <RevoGrid
              class="grid-container"
              autoSizeColumn = "{allColumns: true}"
              colSize= "150"
              theme="compact"
              range="true"
              resize="true"
              rowClass="highlighted"
              grouping= {this.state.grouping}
              columns={this.state.columns}
              columnTypes = {this.columnTypes}
              source={this.state.rowData}
              onAfteredit={(e) => this.afterEdit(e)}
            />
            </Grid.Column>
            <Grid.Column>
            <RevoGrid
              class="grid-container"
              colSize= "100"
              theme="compact"
              range="true"
              resize="true"
              rowClass="highlighted"
              columns={this.state.columns1}
              columnTypes = {this.columnTypes}
              source={this.state.rowData1}
            />
            </Grid.Column>
            </Grid>
            </Container>
          </Container>
      
      </div>
    );
  }
}
