import React, { Component } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
  border-radius: 4px;
  margin: 20px;
  font-family: 'Roboto', sans-serif;
`;

const ErrorTitle = styled.h2`
  margin-top: 0;
  color: #b71c1c;
`;

const ErrorMessage = styled.pre`
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.05);
  padding: 10px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <p>An error occurred while rendering this component.</p>
          {this.state.error && (
            <div>
              <h4>Error details:</h4>
              <ErrorMessage>{this.state.error.toString()}</ErrorMessage>
            </div>
          )}
          {this.state.errorInfo?.componentStack && (
            <div>
              <h4>Component stack:</h4>
              <ErrorMessage>{this.state.errorInfo.componentStack}</ErrorMessage>
            </div>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
