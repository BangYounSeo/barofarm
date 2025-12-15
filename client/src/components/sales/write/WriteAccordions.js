import React from "react";
import {
    Accordion, AccordionSummary, AccordionDetails, Typography,
    TextField, Button, Box, MenuItem, Divider, List,
    ListItem, ListItemButton, ListItemText, IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { EditorContent } from "@tiptap/react";

//공통 스타일
export const accordionStyle = {
    backgroundColor: "#f7f7f7", borderRadius: "10px",
    overflow: "hidden", border: "none", boxShadow: "none",
    "&:before": { display: "none" }, width: "100%"
}

export const inputStyle = {
    backgroundColor: "#ffffff", borderRadius: "10px",
    border: "1px solid #e5e5e5", "& fieldset": { border: "none" }
}

// 임시저장 아코디언
export function DraftAccordion({
    draftList,
    draftExpanded,
    setDraftExpanded,
    loadDraftData,
    deleteDraftData,
    formatDate
}) {
    if (!draftList || draftList.length === 0) return null

    return (
        <Accordion
            expanded={draftExpanded}
            onChange={() => setDraftExpanded(!draftExpanded)}
            sx={{
                backgroundColor: "#ffefe2ff",
                border: "1px solid #ffeddeff",
                borderRadius: "10px !important",
                boxShadow: "none",
                "&:before": { display: "none" },
                overflow: "hidden"
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}
                sx={{ minHeight: "30px", "& .MuiAccordionSummary-content": { my: 1 } }}>

                <Typography sx={{ fontSize: "13px", color: "#545454ff", fontWeight: 600 }}>
                    임시저장된 내용({draftList.length}건)이 있습니다. 불러오시겠습니까?
                </Typography>

            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 1, px: 1 }}>
                <List sx={{ py: 0 }}>
                    {draftList.map((draft, index) => (
                        <React.Fragment key={draft.id}>

                            <ListItem disablePadding
                                secondaryAction={
                                    <IconButton edge="end" size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteDraftData(draft.id);
                                        }}
                                        sx={{ color: "#999" }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <ListItemButton
                                    onClick={() => loadDraftData(draft.id)}
                                    sx={{
                                        px: 2, borderRadius: "6px",
                                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.5)" }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{ fontSize: "14px", fontWeight: 500, color: "#333" }} >
                                                {draft.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <Typography sx={{ fontSize: "12px", color: "#999" }}>
                                                    {formatDate(draft.savedAt)}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>

                            {index < draftList.length - 1 && (
                                <Divider sx={{ my: 0.5, backgroundColor: "rgba(0,0,0,0.05)" }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </AccordionDetails>
        </Accordion>
    )
}

//카테고리 아코디언
export function CategoryAccordion({
    categoryList,
    subCategoryList,
    onSelectCategory,
    productType,
    setProductType,
    productItem,
    setProductItem,
    categoryMode,
    setCategoryMode,
    categorySearchInput,
    setCategorySearchInput,
    categorySearch,
    categorySearchResult
}) {
    return (
        <Accordion sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#000" }}>
                    카테고리
                </Typography>
            </AccordionSummary>

            <AccordionDetails>

                {/* 선택된 카테고리 표시 */}
                {productType && (
                    <Box sx={{
                        mb: 2, p: 1.2, background: "#f1f1f1", fontWeight: 500,
                        borderRadius: "8px", fontSize: "13px", color: "#333"
                    }}>

                        {!productItem && (
                            <>
                                {categoryList.find(c => c.code === productType)?.label}
                            </>
                        )}

                        {productItem && (
                            <>
                                {categoryList.find(c => c.code === productType)?.label}
                                {" → "}
                                {subCategoryList.find(sc => sc.itemCode === productItem)?.itemName}
                            </>
                        )}
                    </Box>
                )}

                <Box sx={{ display: "flex", mb: 1, width: "250px" }}>
                    <Button variant="outlined" onClick={() => setCategoryMode("search")}
                        sx={{
                            fontSize: "12px", border: "1px solid #e5e5e5",
                            color: "#6a6a6aff", background: categoryMode === "search" ? "#ffe9d6" : "#fff"
                        }}>
                        카테고리 검색
                    </Button>

                    <Button variant="outlined" onClick={() => setCategoryMode("select")}
                        sx={{
                            fontSize: "12px", color: "#6a6a6aff", border: "1px solid #e5e5e5",
                            background: categoryMode === "select" ? "#ffe9d6" : "#fff"
                        }}>
                        카테고리 선택
                    </Button>
                </Box>

                {categoryMode === "search" && (
                    <>
                        <TextField fullWidth size="small"
                            placeholder="카테고리명 입력"
                            value={categorySearchInput}
                            onChange={(e) => setCategorySearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && categorySearch()}
                            InputProps={{
                                disableUnderline: true,
                                endAdornment: (
                                    <Box onClick={categorySearch}
                                        sx={{ cursor: "pointer", color: "#666", display: "flex" }}>
                                        <SearchIcon />
                                    </Box>
                                )
                            }}
                            sx={{ ...inputStyle, "& .MuiInputBase-input": { fontSize: "12px", py: 1.1 } }}
                        />

                        {categorySearchResult.length > 0 && (
                            <Box>
                                {categorySearchResult.map((c) => (
                                    <Button key={c.itemCode}
                                        sx={{
                                            width: "100%", justifyContent: "flex-start",
                                            textAlign: "left", borderBottom: "1px solid #eee",
                                            borderRadius: 0, color: "#333", fontSize: "12px"
                                        }}
                                        onClick={() => {
                                            setProductType(c.categoryCode);
                                            onSelectCategory(c.categoryCode, false);
                                            setProductItem(c.itemCode);
                                            categorySearchResult.length = 0
                                        }}>
                                        {c.itemName}
                                    </Button>
                                ))}
                            </Box>
                        )}
                    </>
                )}

                {categoryMode === "select" && (
                    <>
                        <TextField select fullWidth size="small"
                            value={productType}
                            onChange={(e) => {
                                const code = e.target.value;
                                setProductType(code);
                                onSelectCategory(code);
                            }}
                            InputProps={{ disableUnderline: true }}
                            sx={inputStyle} >
                            {categoryList.map((c) => (
                                <MenuItem key={c.code} value={c.code}>
                                    {c.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {productType && subCategoryList.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                <TextField select fullWidth size="small"
                                    value={productItem}
                                    onChange={(e) => setProductItem(e.target.value)}
                                    InputProps={{ disableUnderline: true }}
                                    sx={inputStyle} >
                                    {subCategoryList.map((sc) => (
                                        <MenuItem key={sc.itemCode} value={sc.itemCode}>
                                            {sc.itemName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        )}
                    </>
                )}
            </AccordionDetails>
        </Accordion>
    )
}

// 상품주요정보 아코디언
export function ProductInfoAccordion({
    productName,
    setProductName,
    price,
    onPriceChange,
    origin,
    setOrigin
}) {
    return (
        <Accordion sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                    상품 주요정보
                </Typography>
            </AccordionSummary>

            <AccordionDetails>

                <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1, ml: 0.5 }}>
                    상품명
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value.slice(0, 100))}
                    placeholder="상품명을 입력하세요 (100자)"
                    InputProps={{ disableUnderline: true }}
                    sx={{ ...inputStyle, mb: 2 }}
                />

                <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1, ml: 0.5 }}>
                    판매가
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={price}
                    onChange={onPriceChange}
                    placeholder="판매가를 입력하세요"
                    InputProps={{ disableUnderline: true }}
                    sx={{ ...inputStyle, mb: 2 }}
                />

                <Typography sx={{ fontWeight: 600, fontSize: "14px", mb: 1, ml: 0.5 }}>
                    원산지
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    value={origin}
                    placeholder="예) 경기도 수원시"
                    onChange={(e) => setOrigin(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                    sx={{ ...inputStyle, mb: 1.5 }}
                />
            </AccordionDetails>
        </Accordion>
    )
}

//이미지 아코디언
export function ImageAccordion({
    mainImagePreview,
    mainImageChange,
    extraImages,
    addExtraImage,
    removeExtraImage
}) {
    return (
        <Accordion sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                    상품 이미지
                </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ pl: 2.5 }}>

                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                    대표이미지
                </Typography>

                <Box component="label"
                    sx={{
                        width: 120, height: 120, border: "1px dashed #e3e3e3",
                        borderRadius: 2, background: "#ffffff",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer",
                        overflow: "hidden"
                    }}>

                    {mainImagePreview ? (
                        <img src={mainImagePreview} alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <Typography sx={{ fontSize: "40px", color: "#d0d0d0" }}>+</Typography>
                    )}
                    <input type="file" hidden accept="image/*" onChange={mainImageChange} />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography sx={{ fontWeight: 600 }}>
                    추가이미지 ({extraImages.length}/9)
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>

                    {extraImages.map((img, idx) => (
                        <Box key={idx} sx={{ position: "relative" }}>
                            <Box sx={{
                                width: 100, height: 100,
                                border: "1px dashed #e3e3e3",
                                borderRadius: 2, overflow: "hidden",
                                background: "#ffffff"
                            }} >
                                <img src={img.preview} alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </Box>

                            <Button onClick={() => removeExtraImage(idx)}
                                sx={{
                                    position: "absolute", top: -10, right: -10, minWidth: 0, width: 24,
                                    height: 24, borderRadius: "50%", background: "#fff",
                                    border: "1px solid #ccc"
                                }}>
                                ×
                            </Button>
                        </Box>
                    ))}

                    {extraImages.length < 9 && (
                        <Box component="label"
                            sx={{
                                width: 100, height: 100,
                                border: "1px dashed #e3e3e3",
                                borderRadius: 2, background: "#ffffff",
                                display: "flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer"
                            }}>
                            <Typography sx={{ fontSize: "40px", color: "#d0d0d0" }}>
                                +
                            </Typography>
                            <input type="file" hidden accept="image/*" onChange={addExtraImage} />
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}

//상세 설명 아코디언
export function DescriptionAccordion({ editor, insertDescriptionImage }) {
    return (
        <Accordion sx={accordionStyle}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontSize: "15px", fontWeight: 600 }}>
                    상세 설명
                </Typography>
            </AccordionSummary>

            <AccordionDetails>

                <Box sx={{
                    border: "1px solid #e5e5e5", borderRadius: "10px",
                    minHeight: "150px", width: "100%", boxSizing: "border-box",
                    background: "#ffffff", maxWidth: "100%",
                    "& img": {
                        maxWidth: "100%",
                        height: "auto",
                        display: "block"
                    },
                    "& .ProseMirror": {
                        padding: "10px",
                        minHeight: "130px",
                        outline: "none"
                    },
                    "& .ProseMirror p": {
                        margin: "0",
                        lineHeight: "1.6",
                        marginBottom: "8px"
                    },
                    "& .ProseMirror p:last-child": {
                        marginBottom: "0"
                    }
                }}>
                    <EditorContent editor={editor} />
                </Box>

                <Box component="label"
                    sx={{
                        width: 100, height: 100, mt: 1.5,
                        border: "1px dashed #e3e3e3",
                        borderRadius: 2, background: "#ffffff",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer"
                    }}
                    onClick={insertDescriptionImage}>
                    <Typography sx={{ fontSize: "40px", color: "#d0d0d0" }}>
                        +
                    </Typography>
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}
