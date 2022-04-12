import { Button, Dialog, DialogTitle, Grid, Stack } from '@mui/material';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';
import { UploadedFolderView } from './uploadedFolder';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { UploadFolderFormView } from './uploadFolderForm';

export interface PicEditorViewState {
    uploadedFolders: PicturePartCategoryStruct[]
    uploadFolderFormDisplayed: boolean
}

export class PicEditorView extends React.Component<{}, PicEditorViewState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            uploadedFolders: [],
            uploadFolderFormDisplayed: false
        }
    }

    handleAddFolder() {
        this.setState({ uploadFolderFormDisplayed: true })
    }

    render() {
        return <Stack>
            {this.state.uploadedFolders.map(f => <UploadedFolderView key={f.name} folder={f}></UploadedFolderView>)}
            <Button onClick={() => this.handleAddFolder()}>
                <DriveFolderUploadIcon></DriveFolderUploadIcon>
                Add folder
            </Button>
            <Dialog open={this.state.uploadFolderFormDisplayed} onClose={() => this.setState({ uploadFolderFormDisplayed: false })}>
                <UploadFolderFormView></UploadFolderFormView>
            </Dialog>
        </Stack>
    }
}