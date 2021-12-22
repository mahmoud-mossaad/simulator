import React, { Component } from 'react'
import { Icon, Menu, Segment, Button, Input } from 'semantic-ui-react'
import GridSimulator from './grid/grid'
import Dropzone from 'react-dropzone'
import axios from 'axios';
import NumberColumnType from '@revolist/revogrid-column-numeral';
import SelectTypePlugin from "@revolist/revogrid-column-select";
import styled from 'styled-components';
import ScenarioComparison from './grid/scenario';
import { getToken } from '../../../Utils/Common';



export default class simulator extends Component {
  constructor(props) {

    super(props);
    this.savedCurrentScenario = ''
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
    
  };
  
  state = {
    projectname: '',
    activeItem: 'Main Simulator',
    isUploading: false,
    rowData1: [],
    rowData: [],
    columnsGridMain: [],
    columnsGridSum: [],
    rowDataScenario: [],
    columnsScenario: [],
    valueScenario: [],
    groups: [],
    currentGroup: "",
    grouping: {},
    type: [],
    options: [],
    scenarios: [],
    currentscenario: "",
    companyName: ""

  }

  componentDidMount(){
    axios.get("http://127.0.0.1:5000/getProject", {params: {
      name:this.props.props
    }, headers: {
      'x-access-token': getToken() }})
    .then((res) => {
      console.log(res.data)
      this.setState({
        projectname : this.props.props,
        rowData :res.data['data'],
        type: res.data['type'],
        options: res.data['options'],
        groups: res.data['group'],
        currentGroup: res.data['group'][0].value,
        grouping: {
          props: [res.data['group'][0].value],
          expandedAll: true,
        },
        companyName: this.props.props
      })
    })
  }
  
  handleStateChanges = (newState) => {
    console.log(newState)
    this.setState({rowData: newState.rowData,
      columnsGridMain: newState.columns,
      columnsGridSum: newState.columns1,
      currentscenario: newState.scenario});

}
  handeleScenarioStateChange = (newState) => {
    this.setState({
      rowDataScenario: newState.rowData,
      columnsScenario: newState.columns,
      valueScenario: newState.value})
  }

  handleUpload(e){
    this.setState({
      isUploading: true
    })
    const formData = new FormData();
    formData.append('myFile', this.file, this.filename)
    formData.append('myFile1', this.file1, this.filename1)
    axios.post("http://127.0.0.1:5000/getsop", formData, { headers: {
      'x-access-token': getToken() }
    })
      .then((res) => {
        this.setState({
            projectname: res.data['name'],
            rowData :res.data['data'],
            type: res.data['type'],
            options: res.data['options'],
            groups: res.data['group'],
            currentGroup: res.data['group'][0].value,
            grouping: {
              props: [this.state.currentGroup],
              expandedAll: true,
            },
            companyName: res.data['company']
          }
          )
          this.setState({
            isUploading: false
          })
        
      } 
    )
      .catch((e)=>{
        console.log(e.response)
      })
  }

  handleBrowse(e){
    this.file = e.target.files[0]
    this.filename = e.target.files[0].name
  }
  handleBrowse1(e){
    this.file1 = e.target.files[0]
    this.filename1 = e.target.files[0].name
  }
  handleBrowse2(e){
    this.file2 = e.target.files[0]
    this.filename2 = e.target.files[0].name
  }
  
  handleItemClick = (e, { name }) =>{ 
    console.log(name)
    this.setState({activeItem: name})
  }

  handleScenario(e){
    const formData = new FormData();
    formData.append('myFile', this.file2, this.filename2)
    formData.append('name', this.state.projectname)
    axios.post("http://127.0.0.1:5000/uploadscenario", formData)
      .then((res) => {
        this.setState({rowData :
          Object.values(res.data)[0],
          scenarios: Object.values(res.data)[1]['scenarios'],
          currentscenario: Object.values(res.data)[1]['scenarios'][0].value
          } 
          )
      } 
    )
  }
  ChangeCurrentScenario(e, {value}){
    for(const i in this.state.scenarios){
      if (this.state.scenarios[i].value === value) {
        this.savedCurrentScenario = value
      }
  } 
  this.savedCurrentScenario = value
  this.state.currentscenario = value
  console.log(this.savedCurrentScenario)
  }

  exportCurrentScenario(){
    console.log(this.state.projectname)
    console.log(this.state.currentscenario)
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/savescenario',
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
  

  render() {
    console.log(this.props)
    const { activeItem } = this.state
    if (activeItem == 'Main Simulator') {
      return (
        <div>
          <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse.bind(this)}  style= {{padding:10}}/>
          <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse1.bind(this)}  style= {{padding:10}}/>
          <Button 
              variant="contained"
              color="blue"
              onClick={this.handleUpload.bind(this)} 
              value="handle upload" 
              style= {{padding:10}}
              loading = {this.state.isUploading}
              disabled = {this.state.isUploading || (this.state.filename) ? true : false}>
              Upload
          </Button>
          <div>
              <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse2.bind(this)}  style= {{padding:10}}/>
              <Button
              variant="contained"
              color="blue"
              onClick={this.handleScenario.bind(this)}
              value="handle upload"
              style= {{padding:10}}>
              Upload Scenario
              </Button>
          </div>
          <div>
              <Input
              defaultValue={this.state.currentscenario}
              onChange = {this.ChangeCurrentScenario.bind(this)}
              />
              <Button
              variant="contained"
              color="blue"
              onClick={this.exportCurrentScenario.bind(this)}
              value="Export Scenario"
              style= {{padding:10}}>
              Export Current Scenario
              </Button>
          </div>

          <Segment  color='red' loading={this.state.isUploading} attached='top'>
                <GridSimulator props = {this.state} onChangeData = {this.handleStateChanges}/>
          </Segment>
          <Menu attached='bottom' tabular>
            <Menu.Item
              name='Main Simulator'
              active={activeItem === 'Main Simulator'}
              onClick={this.handleItemClick}
            >
              Main Simulator
            </Menu.Item>

            <Menu.Item
              name='Scenario Comparison'
              active={activeItem === 'Scenario Comparison'}
              onClick={this.handleItemClick}
            >
              Scenario Comparison
            </Menu.Item>

          </Menu>
        </div>
      )
  }
  {
    return (
      <div>
        <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse.bind(this)}  style= {{padding:10}}/>
        <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse1.bind(this)}  style= {{padding:10}}/>
        <Button 
            variant="contained"
            color="blue"
            onClick={this.handleUpload.bind(this)} 
            value="handle upload" 
            style= {{padding:10}}
            loading = {this.state.isUploading}
            disabled = {this.state.isUploading}>
            Upload
        </Button>
        <div>
            <input className= "custom-file-input" type="file" variant="contained" color="primary" onChange = {this.handleBrowse2.bind(this)}  style= {{padding:10}}/>
            <Button
            variant="contained"
            color="blue"
            onClick={this.handleScenario.bind(this)}
            value="handle upload"
            style= {{padding:10}}>
            Upload Scenario
            </Button>
        </div>
        <div>
            <Input
            defaultValue={this.state.currentscenario}
            onChange = {this.ChangeCurrentScenario.bind(this)}
            />
            <Button
            variant="contained"
            color="blue"
            onClick={this.exportCurrentScenario.bind(this)}
            value="Export Scenario"
            style= {{padding:10}}>
            Export Current Scenario
            </Button>
        </div>

        <Segment  color='red' loading={this.state.isUploading} attached='top'>
             <ScenarioComparison props = {this.state} onChangeData = {this.handeleScenarioStateChange}/>
        </Segment>
        <Menu attached='bottom' tabular>
          <Menu.Item
            name='Main Simulator'
            active={activeItem === 'Main Simulator'}
            onClick={this.handleItemClick}
          >
            Main Simulator
          </Menu.Item>

          <Menu.Item
            name='Scenario Comparison'
            active={activeItem === 'Scenario Comparison'}
            onClick={this.handleItemClick}
          >
            Scenario Comparison
          </Menu.Item>

        </Menu>
      </div>
    )
  }
}
}
