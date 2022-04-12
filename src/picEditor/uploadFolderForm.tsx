import { Alert, Button, Paper, Stack, TextField } from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { MAX_IMAGE_HEIGHT, MAX_IMAGE_WIDTH } from '../constants';

export interface UploadedFolder {
    category: PicturePartCategoryStruct
    files: FileList
}

export interface UploadFolderFormViewProps {
    onConfirmClick: (folder: UploadedFolder) => void
}

interface UploadFolderViewState {
    folder: PicturePartCategoryStruct
    uploadResult?: Error | FileList
}

async function getImage(file: File) {
    const blob = new Blob([await file.arrayBuffer()], {});
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    await new Promise((res, rej) => {
        image.onload = e => {
            res(e);
        };
    });
    return image;
}

export class UploadFolderFormView extends React.Component<UploadFolderFormViewProps, UploadFolderViewState> {

    constructor(props: UploadFolderFormViewProps) {
        super(props);
        this.state = {
            folder: {
                name: "",
                position: { x: 0, y: 0 },
                picturesUris: []
            },
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

    async handleFileChange(files: FileList | null) {
        if (files) {
            const promises = [];
            for (let i = 0; i < files.length; i++) {
                promises.push(getImage(files[i]));
            }
            const images = await Promise.all(promises);
            const imagesWithWrongDimensions = images
                .filter(img => img.height > MAX_IMAGE_HEIGHT || img.width > MAX_IMAGE_WIDTH)
                .map((_, i) => `"${files[i].name}"`);
            ;
            if (imagesWithWrongDimensions.length > 0) {
                this.setState({ uploadResult: new Error(`Some images have the wrong dimensions: ${imagesWithWrongDimensions.join(", ")}`) });
            } else {
                this.setState({ uploadResult: files });
            }
        } else {
            this.setState({ uploadResult: undefined });
        }
    }

    renderAlert() {
        if (this.state.uploadResult instanceof Error) {
            return <Alert severity='error'>{this.state.uploadResult.message}</Alert>
        }
        return null;
    }

    handleConfirmClick() {
        if (this.state.uploadResult instanceof FileList) {
            this.props.onConfirmClick({ category: this.state.folder, files: this.state.uploadResult });
        } else if (this.state.uploadResult instanceof Error) {
            alert(this.state.uploadResult.message);
        } else {
            alert("You must upload at least 1 file");
        }
    }

    render() {
        return <Paper>
            <Stack>
                {this.renderAlert()}
                <TextField label="name" onChange={e => this.handleNameChange(e.target.value)}></TextField>
                <TextField label="posX" onChange={e => this.handlePosXChange(Number.parseInt(e.target.value))}></TextField>
                <TextField label="posY" onChange={e => this.handlePosYChange(Number.parseInt(e.target.value))}></TextField>
                <input type="file" multiple accept='image/*' onChange={e => this.handleFileChange(e.target.files)} />
                <Button onClick={() => this.handleConfirmClick()}>
                    <CheckIcon></CheckIcon>
                </Button>
            </Stack>
        </Paper>
    }
}