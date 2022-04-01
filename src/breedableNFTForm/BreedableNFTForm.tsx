import { Button, Paper, Stack, TextField } from "@mui/material"
import React from 'react';
import { BigNumber } from "ethers";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { PicturePartCategoryStruct } from "../../nft-maker/typechain-types/contracts/BreedableNFT";

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

interface BreedableNFTFormState {
    name?: string
    symbol?: string
    breedingFeeInWei?: BigNumber
    fatherGeneChance?: number
    motherGeneChance?: number
    categories: PicturePartCategoryStruct[]
}

export class BreedableNFTForm extends React.Component<{}, BreedableNFTFormState> {

    constructor(props: {}) {
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

    render() {
        return <Stack spacing={1}>
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
