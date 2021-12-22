import React, { useState, useEffect } from 'react';import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment,
  Button,
  Icon,
  Statistic,
  Dimmer,
  Loader,
  Modal,
  Transition,
  Step
} from 'semantic-ui-react'
import {removeUserSession, getToken } from '../../Utils/Common';
import logo from '../../assets/M_logo.png'
import Simulator from './simulator/simulator'
import styled from 'styled-components';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';




const getColor = (props) => {
  if (props.isDragAccept) {
      return '#00e676';
  }
  if (props.isDragReject) {
      return '#ff1744';
  }
  if (props.isDragActive) {
      return '#2196f3';
  }
  return '#eeeeee';
}

const ContainerDrag = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${props => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
`;


function Dashboard(props){
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState([])
  const [userName, setUserName] = useState("")
  const [selected, setSelected] = useState(true)
  const [isGrid, setIsGrid] = useState(false)
  const [isAddProject, setIsAddProject] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [filee, setFilee] = useState([])
  const [filename, setFilename] = useState([])
  const [file1check, setFile1check] = useState(false)
  const [file2check, setFile2check] = useState(true)
  const [uploadcheck, setUploadcheck] = useState(true)
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone();

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/getstudybyuser", {
    headers: {
      'x-access-token': getToken()
  }
  })
  .then((res) => {
    if (projects.length === 0){
      setProjects(res.data.projects)
      setUserName(res.data.name)
      console.log(res.data.projects)
    }
  })
  .catch((error) => {
    console.error(error)
  })
  });
  const files = acceptedFiles.map(file => (
    file
  ));

  const handleLogout = () => {
    removeUserSession();
    props.history.push('/login');
  }

  const handleProjectSelect = (e, { value }) => {
    setCurrentProject(value)
    console.log(currentProject)
    if(currentProject){
      setSelected(false)
      console.log(value)

    }
  }

  const handleProject = () => {
    setIsGrid(true)
  }

  const handleAddProject = () => {
    setIsAddProject(true)
    setFile2check(true)
    setFile1check(false)
    setUploadcheck(true)
    console.log(files)
  }

  const upload = () => {
    if (!file1check && !file2check && !uploadcheck){
      console.log('uploading')
    }
    else if(!file1check && !file2check && uploadcheck){
      setUploadcheck(false)
    }
    else if(!file1check && file2check && uploadcheck){
      setFile2check(false)
      setFile1check(false)
    }
  }
  return(
    
  <div>
      <div>
      <Menu fixed='top' floated>
          <Menu.Item as='a' header>
            <Image size='mini' src= {logo} style={{ marginRight: '1.5em' }} />
            Marketeers
          </Menu.Item>
          <Menu.Item as='a'>Simulator</Menu.Item>

          <Dropdown item simple text='Dropdown'>
            <Dropdown.Menu>
              <Dropdown.Item>List Item</Dropdown.Item>
              <Dropdown.Item>List Item</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Header>Header Item</Dropdown.Header>
              <Dropdown.Item>
                <i className='dropdown icon' />
                <span className='text'>Submenu</span>
                <Dropdown.Menu>
                  <Dropdown.Item>List Item</Dropdown.Item>
                  <Dropdown.Item>List Item</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Item>
              <Dropdown.Item>List Item</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Menu.Menu position='right'>
          <Menu.Item
              name='logout'
              onClick={handleLogout}
            />
          </Menu.Menu>
      </Menu>
    </div>
    <div>
    <Container style={{ marginTop: '7em'}}>
    {!isGrid && !isAddProject
    ?<Container>
    <Header as='h2' icon textAlign='center'>
      <Icon name='user' circular />
      <Header.Content >Welcome {userName}</Header.Content>
    </Header>
    <Statistic.Group color="red" widths='one'>
          <Statistic>
            <Statistic.Value>{projects.length}</Statistic.Value>
            <Statistic.Label>Projects</Statistic.Label>
          </Statistic>
    </Statistic.Group>
    <Segment placeholder>
        <Grid columns={2} relaxed='very' stackable>
          <Grid.Column>
            <Dropdown
              onChange={handleProjectSelect}
              fluid
              selection
              options={projects}
              placeholder='Select Project'
            />
            <Divider inverted />
            <Button animated='vertical' color='red' disabled = {selected} onClick={handleProject}>
              <Button.Content visible>Select Project</Button.Content>
              <Button.Content hidden>
                <Icon name='arrow up' />
            </Button.Content>
          </Button>
          </Grid.Column>

          <Grid.Column verticalAlign='middle'>
          <Button animated='fade' color='red' onClick={handleAddProject}>
            <Button.Content visible>Add New Project</Button.Content>
            <Button.Content hidden>
              <Icon name='plus' />
            </Button.Content>
          </Button>
          </Grid.Column>
        </Grid>
        <Divider vertical>or</Divider>
      </Segment>
      </Container>
      :<br></br>
    }
      <Container>
      <Modal
        centered={true}
        open={isAddProject}
        onClose={() => setIsAddProject(false)}
        onOpen={() => setIsAddProject(true)}
      >
        <Modal.Header>Add Project</Modal.Header>
        <Modal.Content>
        <Grid centered>
        <Step.Group size='small'>
            <Step>
              <Icon disabled= {file1check} name='file excel' />
              <Step.Content>
                <Step.Title>Shipping</Step.Title>
                <Step.Description>Choose your shipping options</Step.Description>
              </Step.Content>
            </Step>

            <Step disabled= {file2check}>
              <Icon name='file excel' />
              <Step.Content>
                <Step.Title>Billing</Step.Title>
                <Step.Description>Enter billing information</Step.Description>
              </Step.Content>
            </Step>

            <Step disabled= {uploadcheck}>
              <Icon name='upload' />
              <Step.Content>
                <Step.Title>Confirm Order</Step.Title>
                <Step.Description>Verify order details</Step.Description>
              </Step.Content>
            </Step>
          </Step.Group>
          </Grid>
          <Segment placeholder>
            <Dimmer isUploading inverted>
                <Loader indeterminate></Loader>
            </Dimmer>
            <Grid columns={2} relaxed='very' stackable>
              {!file1check && file2check
              ?<ContainerDrag {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop HBU file here, or click to select the HBU file</p>
                </ContainerDrag>
              :<ContainerDrag {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop Design file here, or click to select the Design file</p>
                  </ContainerDrag>
              }
            </Grid>
        </Segment>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => upload()}>OK</Button>
        </Modal.Actions>
      </Modal>
      </Container>
      {isGrid
        ? <Simulator props= {currentProject}/>
        : <h1></h1>
      }
    </Container>

    </div>
  </div>
)
  }

export default Dashboard