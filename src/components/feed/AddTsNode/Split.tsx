
import React from "react";
import {Form, Input} from 'antd';


const Split = () => {

  const handleChange=(event:React.ChangeEvent<HTMLInputElement>)=>{
    console.log("TEST")
  }

  return <div className="list-container">
    <Form>
      <Form.Item name='fiter' label='filter'>
        <Input onChange={handleChange}/>
      </Form.Item>
      <Form.Item name='compute_resource' label='compute resource'>
        <Input onChange={handleChange}/>
      </Form.Item>
    </Form>
  </div>;
};

export default Split;
