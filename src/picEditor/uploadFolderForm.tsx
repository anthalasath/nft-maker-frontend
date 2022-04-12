import { Button, Paper, Stack, TextField } from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';

interface UploadFolderViewState {
    folder: PicturePartCategoryStruct
}

export class UploadFolderFormView extends React.Component<{}, UploadFolderViewState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            folder: {
                name: "",
                position: { x: 0, y: 0 },
                picturesUris: []
            }
        }
    }

    handleNameChange(name: string) {
        this.handleChange(f => {
            f.name = name;
        });
    }

    handlePosXChange(value: BigNumberish) {
        this.handleChange(f => {
            f.position.x = value;
        });
    }

    handlePosYChange(value: BigNumberish) {
        this.handleChange(f => {
            f.position.y = value;
        });
    }

    handleChange(updater: (folder: PicturePartCategoryStruct) => void) {
        const folder = this.state.folder;
        updater(folder);
        this.setState({ folder });
    }

    render() {
        return <Paper>
            <Stack>
                <TextField label="name" onChange={e => this.handleNameChange(e.target.value)}></TextField>
                <TextField label="posX" onChange={e => this.handlePosXChange(Number.parseInt(e.target.value))}></TextField>
                <TextField label="posY" onChange={e => this.handlePosYChange(Number.parseInt(e.target.value))}></TextField>
                <Button>
                    <CheckIcon></CheckIcon>
                </Button>
            </Stack>
        </Paper>
    }
}