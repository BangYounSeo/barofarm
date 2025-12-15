import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Checkbox,
    TextField,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OptionDetailTable from "./OptionDetailTable";
import { accordionStyle } from "./WriteAccordions";

const OptionAccordion = ({ optionGroups, setOptionGroups, forceShowOptionList }) => {

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [showOptionList, setShowOptionList] = useState(false);

    const formatNumber = (num) => {
        if (!num) return "";
        const onlyNum = num.toString().replace(/[^0-9]/g, "");
        return onlyNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    useEffect(() => {
        if (forceShowOptionList) {
            setShowOptionList(true)
        }
    }, [forceShowOptionList])

    // ⭐ 옵션 기본 1줄 생성 (옵션추가 버튼 누르기 전에도 입력칸 보이도록 설정)
    useEffect(() => {
        if (optionGroups.length === 0) {
            setOptionGroups([
                {
                    name: "",
                    details: [
                        {
                            optionName: "",
                            optionValue: "",
                            price: 0,
                            stock: 0,
                            saleStatus: "판매중",
                        }
                    ]
                }
            ]);
        }
    }, [optionGroups, setOptionGroups]);

    // ⭐ 옵션 그룹 추가
    const addOptionGroup = () => {
        setOptionGroups(prev => [
            ...prev,
            {
                name: "",
                details: [
                    {
                        optionName: "",
                        optionValue: "",
                        price: 0,
                        stock: 0,
                        saleStatus: "판매중",
                    }
                ]
            }
        ]);
    };

    const toggleSelect = (gIdx, dIdx) => {
        const key = `${gIdx}-${dIdx}`;
        setSelectedOptions(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const selectAll = () => {
        const allKeys = [];

        optionGroups.forEach((group, gIdx) => {
            group.details.forEach((_, dIdx) => {
                allKeys.push(`${gIdx}-${dIdx}`);
            });
        });

        if (selectedOptions.length === allKeys.length) {
            setSelectedOptions([]);
        } else {
            setSelectedOptions(allKeys);
        }
    };

    const deleteSelectedOptions = () => {
        setOptionGroups(prev =>
            prev
                .map((group, gIdx) => ({
                    ...group,
                    details: group.details.filter((_, dIdx) =>
                        !selectedOptions.includes(`${gIdx}-${dIdx}`)
                    ),
                }))
                .filter((g) => g.details.length > 0)
        );
        setSelectedOptions([]);
    };

    const hasDetails = optionGroups.some(group => group.details.length > 0);

    const totalOptionCount = optionGroups.reduce(
        (acc, group) => acc + group.details.length,
        0
    );

    return (
        <Accordion sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                    옵션 설정
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2 }}>

                {/* 옵션 입력 UI (항상 표시) */}
                {optionGroups.map((group, index) => (
                    <Box
                        key={index}
                        sx={{
                            mb: 0.5, pt: 1.5, pb: 0.5, pl: 1,
                            background: "#fff",
                            borderRadius: "8px",
                            border: "1px solid #f3f3f3"
                        }}
                    >
                        <OptionDetailTable
                            index={index}
                            group={group}
                            setOptionGroups={setOptionGroups}
                            setShowOptionList={setShowOptionList}
                        />
                    </Box>
                ))}

                <Button
                    size="small"
                    sx={{
                        fontSize: "12px", mt: 1, ml: 1, mb: 1,
                        color: "#6a6a6aff",
                        background: "#ffe9d6",
                        "&:hover": { background: "#ffd6b3" }
                    }}
                    onClick={addOptionGroup}
                >
                    + 옵션 추가
                </Button>

                {/* 옵션 목록은 옵션 목록 적용 누른 경우만 표시 */}
                {showOptionList && hasDetails && (
                    <Box>
                        <Box
                            sx={{
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, mb: 1, ml: 1, mt: 6 }}>
                                옵션 목록
                            </Typography>

                            {selectedOptions.length > 0 && (
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={deleteSelectedOptions}
                                    sx={{ fontSize: "11px" }}
                                >
                                    선택 삭제
                                </Button>
                            )}
                        </Box>

                        <Table size="small" sx={{
                            background: "#fff", borderRadius: "5px",
                            "& td, & th": { padding: "4px 8px", height: "32px", fontSize: "12px" }
                        }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: "50px", fontSize: "12px" }}>
                                        <Checkbox
                                            size="small"
                                            checked={
                                                totalOptionCount > 0 &&
                                                selectedOptions.length === totalOptionCount
                                            }
                                            indeterminate={
                                                selectedOptions.length > 0 &&
                                                selectedOptions.length < totalOptionCount
                                            }
                                            onChange={selectAll}
                                        />
                                    </TableCell>

                                    <TableCell sx={{ width: "120px", fontSize: "12px" }}>옵션명</TableCell>
                                    <TableCell sx={{ width: "100px", fontSize: "12px" }}>옵션값</TableCell>
                                    <TableCell sx={{ width: "50px", fontSize: "12px" }}>추가금</TableCell>
                                    <TableCell sx={{ width: "50px", fontSize: "12px" }}>재고</TableCell>
                                    <TableCell sx={{ width: "50px", fontSize: "12px" }}>판매상태</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {optionGroups.map((group, gIdx) =>
                                    group.details.map((d, dIdx) => {
                                        const key = `${gIdx}-${dIdx}`;
                                        const numeric = Number(d.stock?.toString().replace(/,/g, ""));
                                        const saleStatus = numeric === 0 ? "품절" : (d.saleStatus || "판매중");

                                        return (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <Checkbox
                                                        size="small"
                                                        checked={selectedOptions.includes(key)}
                                                        onChange={() => toggleSelect(gIdx, dIdx)}
                                                    />
                                                </TableCell>

                                                <TableCell>{d.optionName}</TableCell>
                                                <TableCell>{d.optionValue}</TableCell>

                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={d.price}
                                                        placeholder="0"
                                                        onChange={(e) => {
                                                            const formatted = formatNumber(e.target.value);
                                                            setOptionGroups(prev => {
                                                                const updated = [...prev];
                                                                updated[gIdx].details[dIdx].price = formatted;
                                                                return updated;
                                                            });
                                                        }}
                                                        inputProps={{ inputMode: "numeric" }}
                                                        InputProps={{
                                                            sx: {
                                                                fontSize: "13px",
                                                                height: "28px",
                                                                borderRadius: "10px"
                                                            }
                                                        }}
                                                        sx={{ width: "90px" }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={d.stock}
                                                        placeholder="0"
                                                        onChange={(e) => {
                                                            const formatted = formatNumber(e.target.value);
                                                            const numeric = Number(formatted.replace(/,/g, ""));

                                                            setOptionGroups(prev => {
                                                                const updated = [...prev];
                                                                updated[gIdx].details[dIdx].stock = formatted;
                                                                updated[gIdx].details[dIdx].saleStatus =
                                                                    numeric === 0 ? "품절" : "판매중";
                                                                return updated;
                                                            });
                                                        }}
                                                        inputProps={{ inputMode: "numeric" }}
                                                        InputProps={{
                                                            sx: {
                                                                fontSize: "13px",
                                                                height: "28px",
                                                                borderRadius: "10px"
                                                            }
                                                        }}
                                                        sx={{ width: "90px" }}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <select
                                                        value={saleStatus}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const rawStock = d.stock;
                                                            const numeric = Number(
                                                                String(rawStock || "0").replace(/,/g, "")
                                                            );

                                                            if (numeric === 0 && val === "판매중") {
                                                                alert("재고가 0이면 판매중으로 변경할 수 없습니다.");
                                                                return;
                                                            }

                                                            setOptionGroups(prev => {
                                                                const updated = [...prev];
                                                                updated[gIdx].details[dIdx].saleStatus = val;
                                                                return updated;
                                                            });
                                                        }}
                                                        style={{
                                                            width: "85px", height: "28px",
                                                            fontSize: "12px", paddingLeft: "4px",
                                                            border: "1px solid #e5e5e5",
                                                            borderRadius: "6px",
                                                            color: saleStatus === "품절" ? "red" : "#333",
                                                        }}
                                                    >
                                                        <option value="판매중">판매중</option>
                                                        <option value="품절">품절</option>
                                                    </select>
                                                </TableCell>

                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );
};

export default OptionAccordion;