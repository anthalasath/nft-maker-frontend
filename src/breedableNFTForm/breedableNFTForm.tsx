import { Alert, Button, Paper, Stack, TextField } from "@mui/material"
import React from 'react';
import { BigNumber, Signer, ContractFactory, Contract } from "ethers";
import { PicturePartCategoryStruct } from "nft-maker/typechain-types/contracts/BreedableNFT";

import { PicEditorView } from "../picEditor/picEditorView";
import { BreedableNFTConstructorArgsStruct } from "nft-maker/typechain-types/contracts/BreedableNFTDeployer";
import { deployBreedableNFT, DeployedContractResult } from "../utils/deployBreedableNFT";
import { createClient, store } from "../storage/ipfs";
import { cloneDeep, flatten } from "lodash";
import { UploadedFolder } from "../picEditor/uploadFolderForm";
import { getBreederContractAddress } from "../constants";
import { create } from 'ipfs-core';

export interface BreedableNFTFormProps {
    signer: Signer
}

export interface BreedableNFTFormState {
    constructorArgs: BreedableNFTConstructorArgsStruct
    pictureFilesByCategoryIndex: FileList[]
    deployedContractResult?: DeployedContractResult
}

export class BreedableNFTForm extends React.Component<BreedableNFTFormProps, BreedableNFTFormState> {

    constructor(props: BreedableNFTFormProps) {
        super(props);
        this.state = {
            constructorArgs: {
                name: "",
                symbol: "",
                breedingFeeInWei: BigNumber.from(0),
                fatherGeneChance: 0,
                motherGeneChance: 0,
                categories: [],
                breederContractAddress: ""
            },
            pictureFilesByCategoryIndex: []
        }
    }

    handleNameChange(value: string) {
        this.handleCtorArgsChange(args => {
            args.name = value;
        });
    }

    handleSymbolChange(value: string) {
        this.handleCtorArgsChange(args => {
            args.symbol = value;
        });
    }

    handleBreedingFeeInWeiChange(value: string) {
        this.handleCtorArgsChange(args => {
            args.breedingFeeInWei = BigNumber.from(value)
        });
    }

    handleFatherGeneChanceChange(value: string) {
        this.handleCtorArgsChange(args => {
            args.fatherGeneChance = Number.parseInt(value);
        });
    }

    handleMotherGeneChanceChange(value: string) {
        this.handleCtorArgsChange(args => {
            args.motherGeneChance = Number.parseInt(value);
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
        this.handleCtorArgsChange(args => {
            const cat = args.categories[categoryIndex];
            f(cat);
        });
    }

    handleFolderUploaded(folder: UploadedFolder) {
        const constructorArgs = this.state.constructorArgs;
        constructorArgs.categories.push(folder.category);
        const pictureFilesByCategoryIndex = this.state.pictureFilesByCategoryIndex;
        pictureFilesByCategoryIndex.push(folder.files);
        this.setState({ constructorArgs, pictureFilesByCategoryIndex });
    }

    handleCtorArgsChange(updater: (args: BreedableNFTConstructorArgsStruct) => void) {
        const constructorArgs = this.state.constructorArgs;
        updater(constructorArgs);
        this.setState({ constructorArgs });
    }


    async submitNftCollection() {
        // TODO progress bar
        const ipfs = await createClient();
        const cids = await store(ipfs, this.state.pictureFilesByCategoryIndex);
        const args = cloneDeep(this.state.constructorArgs);
        args.categories = args.categories.map((cat, i) => {
            cat.picturesUris = cids[i].map(cid => `ipfs://${cid.toString()}`);
            return cat;
        });
        const network = await this.props.signer.provider?.getNetwork();
        if (!network) {
            this.setState({ deployedContractResult: new Error("Could not get network")});
            return;
        }
        args.breederContractAddress = getBreederContractAddress(network);
        const deployedContractResult = await deployBreedableNFT(args, this.props.signer);    
        this.setState({ deployedContractResult });
    }

    renderAlert() {
        if (this.state.deployedContractResult) {
            if (this.state.deployedContractResult instanceof String) {
                return <Alert severity="success">Contract deployed at {this.state.deployedContractResult}</Alert>
            } else if (this.state.deployedContractResult instanceof Error) {
                return <Alert severity="error">Could not deploy contract. Error: {this.state.deployedContractResult.message}</Alert>
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
            <PicEditorView onFolderUploaded={folder => this.handleFolderUploaded(folder)}></PicEditorView>
            <Button onClick={() => this.submitNftCollection()}>Deploy</Button>
        </Stack>
    }
}
