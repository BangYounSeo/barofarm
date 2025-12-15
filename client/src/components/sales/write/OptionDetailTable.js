import React from "react";
import { TextField, IconButton, Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const OptionDetailTable = ({ index, group, setOptionGroups, setShowOptionList }) => {

    /* 옵션값 쉼표로 분리하여 여러 옵션 생성 */
    const addDetail = () => {
        const first = group.details?.[0];
        if (!first) return;

        const optionName = first.optionName?.trim() || "";
        const optionValueRaw = first.optionValue?.trim() || "";

        if (!optionName || !optionValueRaw) return;

        const values = optionValueRaw
            .split(",")
            .map(v => v.trim())
            .filter(Boolean);

        setOptionGroups(prev => {
            const updated = [...prev];

            if (!updated[index]) return prev;

            // 옵션 그룹명 자동 설정
            updated[index].name = optionName;

            // 기존 detail 전체 재구성
            updated[index].details = values.map(v => ({
                optionName,
                optionValue: v,
                price: 0,
                stock: 0,
                saleStatus: "판매중",
            }));
            return updated;
        });

        // 옵션 목록 보이도록 설정
        if (setShowOptionList) {
            setShowOptionList(true);
        }
    };

    const changeDetailValue = (detailIndex, key, value) => {
        if (value.length > 15) return;

        setOptionGroups(prev => {
            const updated = [...prev];
            
            // 안전성 체크 추가
            if (!updated[index] || !updated[index].details || !updated[index].details[detailIndex]) {
                return prev;
            }

            updated[index].details[detailIndex][key] = value;

            if (key === "optionName") {
                updated[index].name = value;
            }
            return updated;
        });
    };

    /* 첫 줄 삭제 */
    const clearFirstLine = () => {
        setOptionGroups(prev => {
            const updated = [...prev];

            if (!updated[index] || !updated[index].details) return prev;

            // 첫 번째 detail 삭제
            updated[index].details.splice(0, 1);

            // 해당 그룹에 detail이 없으면 그룹 자체 제거
            if (updated[index].details.length === 0) {
                updated.splice(index, 1);
            }

            return updated;
        });
    };

    const first = group.details?.[0] || {
        optionName: "",
        optionValue: "",
    };

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TextField
                    size="small"
                    placeholder="[옵션명] 예시) 색상"
                    value={first.optionName || ""}
                    onChange={(e) => changeDetailValue(0, "optionName", e.target.value)}
                    sx={{ width: "35%" }}
                    multiline
                    inputProps={{ maxLength: 15 }}
                    InputProps={{
                        sx: { fontSize: "12px", borderRadius: "10px" }
                    }}
                />

                <TextField
                    size="small"
                    placeholder="[옵션값] 예시) 빨강,주황,노랑"
                    value={first.optionValue || ""}
                    onChange={(e) => changeDetailValue(0, "optionValue", e.target.value)}
                    sx={{ width: "35%" }}
                    multiline
                    inputProps={{ maxLength: 30 }}
                    InputProps={{
                        sx: { fontSize: "12px", borderRadius: "10px" }
                    }}
                />

                <IconButton size="small" onClick={clearFirstLine}>
                    <DeleteIcon fontSize="small" />
                </IconButton>

                <Button
                    size="small"
                    onClick={addDetail}
                    sx={{
                        fontSize: "12px",
                        background: "#ffe9d6",
                        color: "#6a6a6aff",
                        height: "25px",
                        ml: "30px",
                        borderRadius: "5px",
                        whiteSpace: "nowrap"
                    }}
                >
                    옵션 목록으로 적용 ⬇
                </Button>
            </Box>
        </Box>
    );
};

export default OptionDetailTable;