import React from "react";
import { defineCustomElements} from "@revolist/revogrid/loader";
import { RevoGrid } from "@revolist/revogrid-react";
import axios from 'axios';
import { Container, Grid, Dropdown, Button, Icon } from "semantic-ui-react";
import NumberColumnType from '@revolist/revogrid-column-numeral';
import SelectTypePlugin from "@revolist/revogrid-column-select";


export default class ScenarioComparison extends React.Component {
    constructor(props) {
      super(props);
      defineCustomElements();
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
      this.increased={}
      this.decreased={}
      this.initial_columns = [
        {

          prop: "SKUs",
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
      ]
      this.state = {
        isFetching: false,
        multiple: true,
        search: true,
        searchQuery: null,
        value: [],
        options:[],
        columns: [],
        rowData: [],
        projectname: ""
        }
    }

    UpdateColumns(data){
      let cs = [...this.initial_columns];
      for (const key in this.state.value){
        this.increased[key] = []
        this.decreased[key] = []
        for (var i = 0; i < this.state.rowData.length; i++) {
          if(this.state.rowData[i].SOP>this.state.rowData[i][this.state.value[key]]){
           this.decreased[key].push(this.state.rowData[i]['SKUs'])
          }
          else{ 
            if(this.state.rowData[i].SOP<this.state.rowData[i][this.state.value[key]]){
            this.increased[key].push(this.state.rowData[i]['SKUs'])
          }
          }
        }
          cs.push({
            prop: data[this.state.value[key]],
            name: data[this.state.value[key]],
            columnType: 'three',
            readonly: "true",
            cellProperties: ({prop, model, data, column}) => {
                
              if(this.increased[key].includes(model['SKUs']))
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
            if(this.decreased[key].includes(model['SKUs']))
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
          })
      }   
      this.setState({columns:cs})
    }

    handleChange = (e, { value }) => {
        this.setState({ value })
    }

    compareScenarios(e){
        const data = {}
        data['name'] = this.props.props.projectname
        data['scenarios'] = this.state.value
        axios({
            method: 'post',
            url: 'http://127.0.0.1:5000/comparescenario',
            headers: { 
              'Content-Type': 'text/plain'
            },
            data : data
          })
          .then((res) => {
            this.setState({
              rowData: res.data.data
            })
            this.UpdateColumns(res.data)
            this.props.onChangeData({'rowData': this.state.rowData, 'columns': this.state.columns, 'value': this.state.value})
            })
      }

      handleChangedSOP(){
        this.increased=[]
        this.decreased=[]
        for (var i = 0; i < this.state.rowData.length; i++) {
          if(this.state.rowData[i].SOP>this.state.rowData[i].Changed_SOP){
           this.decreased.push(this.state.rowData[i]['SKUs'])
          }
          else{ if(this.state.rowData[i].SOP<this.state.rowData[i].Changed_SOP){
            this.increased.push(this.state.rowData[i]['SKUs'])
          }
          }
        }
      }

      saveScenarioComparison(){
        axios({
          method: 'post',
          url: 'http://127.0.0.1:5000/savescenariocomparison',
          headers: { 
            'Content-Type': 'text/plain'
          },
          data : this.state,
          responseType: 'blob'
        })
        .then(({ data }) => {
          const downloadUrl = window.URL.createObjectURL(new Blob([data]));
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', this.savedCurrentScenario+'.xlsx') //any other extension
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        )
      }

    componentWillReceiveProps(newProps){
        console.log(newProps)
        this.setState({
          rowData: newProps.props.rowDataScenario,
          columns: newProps.props.columnsScenario,
          value: newProps.props.valueScenario,
          projectname: newProps.props.projectname
        })
      }

    handleSearchChange = (e, { searchQuery }) => this.setState({ searchQuery })
    render() {
        const { multiple, options, isFetching, search, value } = this.state
        return (
          <div>
              <Dropdown
                fluid
                selection
                multiple={multiple}
                search={search}
                options={this.props.props.scenarios}
                value={value}
                placeholder='Add Scenario'
                onChange={this.handleChange}
                onSearchChange={this.handleSearchChange}
                disabled={isFetching}
                loading={isFetching}
            />
                <Button
                variant="contained"
                color="blue"
                onClick={this.compareScenarios.bind(this)}
                value="compare scenarios"
                style= {{padding:10}}>
                Compare Scenarios
                </Button>
                <RevoGrid
                  class="grid-container"
                  colSize= "150"
                  theme="compact"
                  range="true"
                  resize="true"
                  rowClass="highlighted"
                  columns={this.state.columns}
                  columnTypes = {this.columnTypes}
                  source={this.state.rowData}
                />
                <Button
                variant="contained"
                color="blue"
                onClick={this.saveScenarioComparison.bind(this)}
                value="compare scenarios"
                style= {{padding:10}}>
                Save Scenarios
                </Button>
            </div>
              );
    } 
}