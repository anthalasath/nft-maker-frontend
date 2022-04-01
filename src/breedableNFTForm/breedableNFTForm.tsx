import { Alert, Button, Paper, Stack, TextField } from "@mui/material"
import React from 'react';
import { BigNumber, Signer, ContractFactory } from "ethers";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { PicturePartCategoryStruct } from "../../nft-maker/typechain-types/contracts/BreedableNFT";
import BreedableNFTArtifact from "../../nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json"

interface PicturePartCategoryViewProps {
    picturePart: PicturePartCategoryStruct
    handleNameChange: (value: string) => void
    handlePosXChange: (value: number) => void
    handlePosYChange: (value: number) => void
    handleAddPictureUriClick: () => void
    handlePictureUriChange: (index: number, value: string) => void
}

function PicturePartCategoryView(props: PicturePartCategoryViewProps) {
    return <Paper>
        <TextField label="name" onChange={e => props.handleNameChange(e.target.value)}></TextField>
        <TextField label="posX" onChange={e => props.handlePosXChange(Number.parseInt(e.target.value))}></TextField>
        <TextField label="posY" onChange={e => props.handlePosYChange(Number.parseInt(e.target.value))}></TextField>
        {props.picturePart.picturesUris.map((_, index) => <TextField label="uri" onChange={e => props.handlePictureUriChange(index, e.target.value)}></TextField>)}
        <Button variant="contained" onClick={() => props.handleAddPictureUriClick()}>
            <AddBoxIcon></AddBoxIcon>
        </Button>
    </Paper>
}

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
    name?: string
    symbol?: string
    breedingFeeInWei?: BigNumber
    fatherGeneChance?: number
    motherGeneChance?: number
    categories: PicturePartCategoryStruct[]
    deployedContractResult?: DeployedContractResult
}

export class BreedableNFTForm extends React.Component<BreedableNFTFormProps, BreedableNFTFormState> {

    constructor(props: BreedableNFTFormProps) {
        super(props);
        this.state = {
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
        const BreedableNFT = new ContractFactory(BreedableNFTArtifact.abi, BreedableNFTArtifact.bytecode, this.props.signer);
        try {
            const breedableNFT = await BreedableNFT.deploy(
                this.state.name,
                this.state.symbol,
                this.state.breedingFeeInWei,
                this.state.fatherGeneChance,
                this.state.motherGeneChance,
                this.state.categories
            );
            await breedableNFT.deployed();
            this.setState({ deployedContractResult: DeployedContractResult.success(breedableNFT.address) })
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
            {this.state.categories.map((cat, categoryIndex) => <PicturePartCategoryView
                picturePart={cat}
                handleNameChange={value => this.handleCategoryNameChange(categoryIndex, value)}
                handlePosXChange={value => this.handleCategoryPosXChange(categoryIndex, value)}
                handlePosYChange={value => this.handleCategoryPosYChange(categoryIndex, value)}
                handleAddPictureUriClick={() => this.handleAddCategoryPictureUriClick(categoryIndex)}
                handlePictureUriChange={(index, value) => this.handleCategoryPictureUriChange(categoryIndex, index, value)}
            ></PicturePartCategoryView>)}
            <Button variant="contained" onClick={() => this.handleAddCategoryClick()}>
                <AddBoxIcon></AddBoxIcon>
            </Button>
        </Stack>
    }
}
