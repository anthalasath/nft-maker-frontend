import { Alert, Button, Paper, Stack, TextField } from "@mui/material"
import React from 'react';
import { BigNumber, Signer, ContractFactory, Contract } from "ethers";
import { PicturePartCategoryStruct } from "nft-maker/typechain-types/contracts/BreedableNFT";
import BreedableNFTDeployerArtifact from "nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import { BreedableNFTDeployer } from "nft-maker/typechain-types/contracts/BreedableNFTDeployer";
import { getBreederContractAddress, getDeployerContractAddress } from "../constants";
import { PicEditorView } from "../picEditor/picEditorView";

export interface BreedableNFTFormProps {
    signer: Signer
}

class DeployedContractResult {
    private _address?: string
    private _error?: any

    public get isSuccess() {
        return !!this._address;
    }

    public get address() {
        return this._address;
    }

    public get error() {
        return this._error;
    }

    private constructor(address?: string, error?: any) {
        this._address = address;
        this._error = error;
    }

    static success(contractAddress: string) {
        return new DeployedContractResult(contractAddress, undefined);
    }

    static failure(deployError: any) {
        return new DeployedContractResult(undefined, deployError);
    }
}

export interface BreedableNFTFormState {
    name: string
    symbol: string
    breedingFeeInWei: BigNumber
    fatherGeneChance: number
    motherGeneChance: number
    categories: PicturePartCategoryStruct[]
    deployedContractResult?: DeployedContractResult
}

export class BreedableNFTForm extends React.Component<BreedableNFTFormProps, BreedableNFTFormState> {

    constructor(props: BreedableNFTFormProps) {
        super(props);
        this.state = {
            name: "",
            symbol: "",
            breedingFeeInWei: BigNumber.from(0),
            fatherGeneChance: 0,
            motherGeneChance: 0,
            categories: []
        }
    }

    handleNameChange(value: string) {
        this.setState({
            name: value
        });
    }

    handleSymbolChange(value: string) {
        this.setState({
            symbol: value
        });
    }

    handleBreedingFeeInWeiChange(value: string) {
        this.setState({
            breedingFeeInWei: BigNumber.from(value)
        });
    }

    handleFatherGeneChanceChange(value: string) {
        this.setState({
            fatherGeneChance: Number.parseInt(value)
        });
    }

    handleMotherGeneChanceChange(value: string) {
        this.setState({
            motherGeneChance: Number.parseInt(value)
        });
    }

    handleCategoryNameChange(categoryIndex: number, value: string) {
        this.handleCategoryChange(categoryIndex, cat => {
            cat.name = value;
        });
    }

    handleCategoryPosXChange(categoryIndex: number, value: number) {
        this.handleCategoryChange(categoryIndex, cat => {
            cat.position.x = value;
        });
    }

    handleCategoryPosYChange(categoryIndex: number, value: number) {
        this.handleCategoryChange(categoryIndex, cat => {
            cat.position.y = value;
        });
    }

    handleAddCategoryPictureUriClick(categoryIndex: number) {
        this.handleCategoryChange(categoryIndex, cat => {
            cat.picturesUris.push("");
        });
    }

    handleCategoryPictureUriChange(categoryIndex: number, pictureUriIndex: number, value: string) {
        this.handleCategoryChange(categoryIndex, cat => {
            cat.picturesUris[pictureUriIndex] = value;
        });
    }

    handleCategoryChange(categoryIndex: number, f: (value: PicturePartCategoryStruct) => void) {
        const cat = this.state.categories[categoryIndex];
        f(cat);
        this.setState({ categories: this.state.categories })
    }

    handleAddCategoryClick() {
        const categories = this.state.categories;
        categories.push({
            name: "",
            position: { x: 0, y: 0 },
            picturesUris: []
        });
        this.setState({ categories: categories });
    }

    async deployContract() {
        const network = await this.props.signer.provider?.getNetwork();
        if (!network) {
            this.setState({ deployedContractResult: DeployedContractResult.failure("Could not get network") })
            return;
        }
        const deployerContractAddress = getDeployerContractAddress(network);
        const breederContractAddress = getBreederContractAddress(network);
        const deployer = new Contract(deployerContractAddress, BreedableNFTDeployerArtifact.abi, this.props.signer) as BreedableNFTDeployer;
        try {
            const tx = await deployer.deploy({
                name: this.state.name,
                symbol: this.state.symbol,
                breedingFeeInWei: this.state.breedingFeeInWei,
                fatherGeneChance: this.state.fatherGeneChance,
                motherGeneChance: this.state.motherGeneChance,
                categories: this.state.categories,
                breederContractAddress: breederContractAddress
            });
            await tx.wait();
            const eventFilter = deployer.filters.BreedableNFTDeployed(null, await this.props.signer.getAddress());
            const latestBlockNumber = await this.props.signer.provider?.getBlockNumber();
            if (!latestBlockNumber) {
                this.setState({ deployedContractResult: DeployedContractResult.failure("Deployment probably succeeded, but could not get latest block number") })
                return;
            }
            // TODO: Edge case with multiple deployments within same transaction ?
            const events = await deployer.queryFilter(eventFilter, latestBlockNumber);
            const event = events[0];

            this.setState({ deployedContractResult: DeployedContractResult.success(event.args.contractAddress) })
        } catch (err: any) {
            this.setState({ deployedContractResult: DeployedContractResult.failure(err) })
        }
    }

    renderAlert() {
        if (this.state.deployedContractResult) {
            if (this.state.deployedContractResult.isSuccess) {
                return <Alert severity="success">Contract deployed at {this.state.deployedContractResult.address}</Alert>
            } else {
                return <Alert severity="error">Could not deploy contract. Error: {this.state.deployedContractResult.error}</Alert>
            }
        } else {
            return null;
        }
    }

    render() {
        return <Stack spacing={1}>
            {this.renderAlert()}
            <TextField label="name" onChange={e => this.handleNameChange(e.target.value)}>
            </TextField>
            <TextField label="symbol" onChange={e => this.handleSymbolChange(e.target.value)}>
            </TextField>
            <TextField label="breedingFeeInWei" onChange={e => this.handleBreedingFeeInWeiChange(e.target.value)}>
            </TextField>
            <TextField label="fatherGeneChance" onChange={e => this.handleFatherGeneChanceChange(e.target.value)}>
            </TextField>
            <TextField label="motherGeneChance" onChange={e => this.handleMotherGeneChanceChange(e.target.value)}>
            </TextField>
            <PicEditorView></PicEditorView>
            <Button onClick={() => this.deployContract()}>Deploy</Button>
        </Stack>
    }
}
