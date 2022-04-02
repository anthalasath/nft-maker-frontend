import { Button, Grid } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { BreedableNFTForm } from './breedableNFTForm/breedableNFTForm';
import { Contract, ethers, Signer } from "ethers";
import { Web3Provider } from '@ethersproject/providers';
import { Dashboard } from './dashboard/dashboard';
import { getDeployerContractAddress } from './constants';
interface ConnectWalletButtonProps {
  provider: Web3Provider
  handleWalletConnected: (signer: Signer) => void
}

class ConnectWalletButton extends React.Component<ConnectWalletButtonProps, {}> {
  constructor(props: ConnectWalletButtonProps) {
    super(props);
    this.state = {}
  }

  async handleClick() {
    await this.props.provider.send("eth_requestAccounts", []);
    const signer = this.props.provider.getSigner();
    this.props.handleWalletConnected(signer);
  }

  render() {
    return <Button variant="contained" onClick={() => this.handleClick()}>
      Connect Wallet
    </Button>
  }
}

function CenteredPage(props: { element: JSX.Element }) {
  return <Grid container>
    <Grid item xs={4}></Grid>
    <Grid item xs={4}>
      {props.element}
    </Grid>
    <Grid item xs={4}></Grid>
  </Grid>
}

interface AppState {
  signer?: Signer
}

declare global {
  interface Window { ethereum: any; }
}

window.ethereum = window.ethereum || {};

class App extends React.Component<{}, AppState> {

  constructor(props: {}) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  handleWalletConnected(signer: Signer) {
    this.setState({ signer });
  }

  render() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    if (this.state.signer) {
      return <Dashboard signer={this.state.signer}></Dashboard>;
    } else {
      const element = this.state.signer ?
        <BreedableNFTForm signer={this.state.signer}></BreedableNFTForm> :
        <ConnectWalletButton provider={provider} handleWalletConnected={signer => this.handleWalletConnected(signer)}></ConnectWalletButton>
      return <CenteredPage element={element}></CenteredPage>
    }
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
  document.getElementById('root')
);