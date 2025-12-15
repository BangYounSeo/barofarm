// src/components/sales/write/OptionGroupInput.js
import React from "react";
import { TextField, Box } from "@mui/material";

const OptionGroupInput = ({ index, group, setOptionGroups }) => {

    // 옵션명 변경
    const changeGroupName = (e) => {
        const value = e.target.value;
        setOptionGroups(prev => {
            const updated = [...prev];
            updated[index].groupName = value;
            return updated;
        });
    };

    return (
        <Box sx={{ mb: 1 }}>
            <TextField
                label="옵션명"
                size="small"
                value={group.groupName}
                onChange={changeGroupName}
                sx={{ width: "30%" }}
                placeholder="예: 구성선택"
            />
        </Box>
    );
};

export default OptionGroupInput;