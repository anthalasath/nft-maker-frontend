import { Button, Dialog, DialogTitle, Grid, Stack } from '@mui/material';
import { PicturePartCategoryStruct } from 'nft-maker/typechain-types/contracts/BreedableNFTDeployer';
import React from 'react';
import { UploadedFolderView } from './uploadedFolder';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import { UploadedFolder, UploadFolderFormView } from './uploadFolderForm';

export interface PicEditorViewProps {
    onFolderUploaded: (folder: UploadedFolder) => void
}

export interface PicEditorViewState {
    uploadedFolders: UploadedFolder[]
    uploadFolderFormDisplayed: boolean
}

export class PicEditorView extends React.Component<PicEditorViewProps, PicEditorViewState> {

    constructor(props: PicEditorViewProps) {
        super(props);
        this.state = {
            uploadedFolders: [],
            uploadFolderFormDisplayed: false
        }
    }

    handleAddFolder() {
        this.setState({ uploadFolderFormDisplayed: true })
    }

    handleConfirmClick(folder: UploadedFolder) {
        const uploadedFolders = this.state.uploadedFolders;
        uploadedFolders.push(folder);
        this.setState({ uploadedFolders, uploadFolderFormDisplayed: false });
        this.props.onFolderUploaded(folder);
    }

    render() {
        return <Stack>
            {this.state.uploadedFolders.map(f => <UploadedFolderView key={f.category.name} folder={f}></UploadedFolderView>)}
            <Button onClick={() => this.handleAddFolder()}>
                <DriveFolderUploadIcon></DriveFolderUploadIcon>
                Add folder
            </Button>
            <Dialog open={this.state.uploadFolderFormDisplayed} onClose={() => this.setState({ uploadFolderFormDisplayed: false })}>
                <UploadFolderFormView onConfirmClick={folder => this.handleConfirmClick(folder)}></UploadFolderFormView>
            </Dialog>
        </Stack>
    }
}