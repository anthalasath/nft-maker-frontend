import { Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from "react";

export interface BackButtonViewProps {
    onClick: () => void
}

export function BackButtonView(props: BackButtonViewProps) {
    return <Button onClick={props.onClick}><ArrowBackIcon></ArrowBackIcon></Button>
}