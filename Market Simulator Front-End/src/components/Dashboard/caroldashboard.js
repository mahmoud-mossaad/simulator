import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { Grid, Input, Select } from 'react-spreadsheet-grid'

const rows = [
    { id: 'user1', name: 'John Doe' },
    // and so on...
];

function Dashboard(props) {
    const [rowData, setRowData] = useState([]);

    
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/editsopbyvalue", { params: { "value": 0.22 }})
        .then((res) => {
        //console.log(res.data)
        setRowData(res.data)
        console.log(rowData)
        //setRowData(res.data)
      }
      )
        }, [])
  return (
    <Grid
      columns={[
        {
          title: () => 'SKUs',
          value: (row, { focus }) => {
              return (
                  <Input
                    value={row.SKUs}
                    focus={focus}
                  />
              );
          }
        },
        {
            title: () => 'SOP',
            value: (row, { focus }) => {
                return (
                    <Input
                      value={row.SOP}
                      focus={focus}
                    />
                );
            }
          }, 
          {
            title: () => 'Changed SOP',
            value: (row, { focus }) => {
                return (
                    <Input
                      value={row.name}
                      focus={focus}
                    />
                );
            }
          }, 
      ]}
      rows={rows}
      getRowKey={row => row.id}
    />
  )
}
export default Dashboard;