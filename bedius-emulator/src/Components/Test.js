import React from "react";
export default class Test extends React.Component {
  render() {
    return <div width="1024px" height="768px" dangerouslySetInnerHTML={{ __html: "<iframe width='1024px' height='768px' src='C:/HCB-HTML/pay.html' />"}} />;
  }
}
