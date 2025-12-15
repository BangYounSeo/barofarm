import React, { useState, useEffect, useContext, useLayoutEffect } from "react";
import {
    Box, Stack, Typography, Button,
    Accordion, AccordionSummary, AccordionDetails,
    List, ListItem, ListItemButton, ListItemText,
    IconButton, Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import OptionAccordion from "./OptionAccordion";
import {
    CategoryAccordion,
    ProductNameAccordion,
    PriceAccordion,
    ImageAccordion,
    DescriptionAccordion,
    ProductInfoAccordion,
    DraftAccordion
} from "./WriteAccordions";
import { saveDraft, loadDraft, loadDraftList, deleteDraft, formatDate } from "./DraftSave";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { getProductItems, searchProductItem } from "../../../service/SalesList";
import { createProduct, getProductDetail, updateProduct } from "../../../service/SalesList";
import { fileToBase64 } from "./DraftSave";
import { MemberContext } from "../../member/login/MemberContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../service/AxiosConfig";

const Write = () => {

    const loginUserId = localStorage.getItem("userId")
    const { loggedIn } = useContext(MemberContext)
    const [optionGroups, setOptionGroups] = useState([])
    const [saving, setSaving] = useState(false) //중복 저장 방지용 상태 추가
    const { numBrd } = useParams()
    const isEdit = !!numBrd //수정 모드인지 체크
    const navigate = useNavigate()
    const location = useLocation()
    const returnTo = location.state?.returnTo || "/sales/list"

    async function convertBase64Images(html) {

        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g
        let updatedHtml = html
        let match
        let index = 0

        while ((match = imgRegex.exec(updatedHtml)) !== null) {
            let src = match[1]

            console.log(src)

            // http 이면 건너뛰기
            if (src.startsWith("http")) continue

            // blob → base64 변환
            if (src.startsWith("blob:")) {
                const blobFile = await fetch(src).then(r => r.blob())
                src = await fileToBase64(blobFile)
            }

            // base64 여부 확인
            if (!src.startsWith("data:image")) continue

            const fileName = `desc_${Date.now()}_${index}.png`
            index++

            const formData = new FormData()
            formData.append("base64", src)
            formData.append("fileName", fileName)

            const res = await api.post("/upload/base64", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            const s3Url = res.data

            if (!s3Url || !s3Url.startsWith("http")) {
                console.error("이미지 업로드 실패:", res)
                continue
            }

            //정규식으로 모든 경우 치환
            updatedHtml = updatedHtml.replace(new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), s3Url)
        }

        return updatedHtml
    }

    const categories = [
        { label: "쌀·잡곡", type: "쌀·잡곡", code: 100 },
        { label: "채소", type: "채소", code: 200 },
        { label: "견과·버섯", type: "견과·버섯", code: 300 },
        { label: "과일", type: "과일", code: 400 }
    ]

    const [currentDraftId, setCurrentDraftId] = useState(null)
    const [subCategoryList, setSubCategoryList] = useState([])

    const [productType, setProductType] = useState("")
    const [productItem, setProductItem] = useState("")

    const [categoryMode, setCategoryMode] = useState("search")
    const [categorySearchInput, setCategorySearchInput] = useState("")
    const [categorySearchResult, setCategorySearchResult] = useState([])

    const [productName, setProductName] = useState("")
    const [price, setPrice] = useState("")
    const [origin, setOrigin] = useState("")

    const [mainImage, setMainImage] = useState(null)
    const [mainImagePreview, setMainImagePreview] = useState("")

    const [extraImages, setExtraImages] = useState([])

    const [status, setStatus] = useState("common")

    const [draftList, setDraftList] = useState([])
    const [draftExpanded, setDraftExpanded] = useState(false)

    const editor = useEditor({
        extensions: [StarterKit, Image],
        content: ""
    })

    //로그인한 회원의 draft만 불러오도록 변경
    useEffect(() => {
        if (loginUserId) {
            const list = loadDraftList().filter((d) => d.userId === loginUserId)
            setDraftList(list)
        }
    }, [loginUserId])

    //대분류 선택 시 소분류 자동 조회
    const categorySelect = async (code, resetItem = true) => {
        setProductType(code)
        const subs = await getProductItems(code)
        setSubCategoryList(Array.isArray(subs) ? subs : [])

        if (resetItem) {
            setProductItem("")
        }
    }

    //카테고리 검색
    const categorySearch = async () => {
        const word = categorySearchInput.trim().toLowerCase()

        if (!word) {
            setCategorySearchResult([])
            return
        }

        const searchList = await searchProductItem(categorySearchInput)
        setCategorySearchResult(searchList)
    }

    const priceChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "")
        if (value === '') return setPrice("")
        value = String(Number(value))
        const formatted = Number(value).toLocaleString()
        setPrice(formatted)
    }

    const mainImageChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setMainImage(file)
        setMainImagePreview(URL.createObjectURL(file))
    }

    const addExtraImage = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (extraImages.length >= 5) {
            alert("최대 5장까지 가능합니다.")
            return
        }

        const preview = URL.createObjectURL(file)
        setExtraImages((prev) => [...prev, { file, preview }])
    }

    const removeExtraImage = (idx) => {
        setExtraImages((prev) => prev.filter((_, i) => i !== idx))
    }

    const insertDescriptionImage = () => {
        if (!editor) return

        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"

        input.onchange = () => {
            const file = input.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = () => {
                editor.chain().focus().setImage({ src: reader.result }).run()
            }
            reader.readAsDataURL(file)
        }
        input.click()
    }

    //임시저장
    const DraftBoard = async () => {

        if (!loggedIn || !loginUserId) {
            alert("로그인 후 이용해주세요.")
            return
        }

        if (!window.confirm("임시저장 시 상세설명 내 이미지는 저장되지 않습니다.\n임시저장하시겠습니까?")) {
            return
        }

        const draft = await saveDraft(
            productType, productItem, productName, origin, price, editor,
            mainImage, extraImages, currentDraftId, loginUserId, optionGroups
        )

        //userId 기준으로 재필터링
        setDraftList(
            loadDraftList().filter((d) => d.userId === loginUserId)
        )

        setDraftExpanded(false)

        //새로 저장한 경우 currentDraftId 설정
        if (!currentDraftId) {
            setCurrentDraftId(draft.id)
        }

        alert("임시저장 되었습니다.")
    }

    //임시저장된 내용 불러오기
    const loadDraftData = async (draftId) => {
        const draft = loadDraft(draftId)
        if (!draft) {
            alert("임시저장 내용을 찾을 수 없습니다.")
            return
        }

        //현재 불러온 임시저장 ID 저장
        setCurrentDraftId(draftId)

        //대분류
        setProductType(draft.productType)

        //대분류 선택 후 자동으로 소분류 목록 로드
        if (draft.productType) {
            await categorySelect(draft.productType, false)
        }

        //소분류
        if (draft.productItem) {
            setProductItem(draft.productItem)
        }

        //상품명,가격,원산지
        setProductName(draft.productName || "")
        setPrice(draft.price || "")
        setOrigin(draft.origin || "")

        //옵션 복원
        if (draft.optionGroups) {
            setOptionGroups(draft.optionGroups)
        }

        //대표이미지 복원
        if (draft.mainImage) {
            setMainImage(null)
            setMainImagePreview(draft.mainImage)
        }

        //추가 이미지 복원
        if (draft.extraImages?.length > 0) {
            const restored = draft.extraImages.map((img) => ({
                //preview: img.base64
                file: null,
                preview: img.preview
            }))
            setExtraImages(restored)
        }

        //상세설명 복원
        const loadDescription = () => {
            if (editor && !editor.isDestroyed && draft.descHtml) {
                try {
                    editor.commands.clearContent()
                    editor.commands.setContent(draft.descHtml)
                    console.log("에디터 내용 복원 완료")
                } catch (error) {
                    console.error("에디터 복원 실패:", error)
                }
            }
        }

        setTimeout(loadDescription, 50)
        setTimeout(loadDescription, 150)
        setTimeout(loadDescription, 300)

        setDraftExpanded(false)
        alert("임시저장된 내용을 불러왔습니다.")
    }

    //임시저장 삭제
    const deleteDraftData = (draftId) => {
        if (window.confirm("이 임시저장을 삭제하시겠습니까?")) {
            deleteDraft(draftId, loginUserId)  //userId 같이 보내기

            const updatedList = loadDraftList().filter(d => d.userId === loginUserId)
            setDraftList(updatedList)

            if (currentDraftId === draftId) {
                setCurrentDraftId(null)
            }
            alert("삭제되었습니다.")
        }
    }

    //판매하기
    const saveProduct = async () => {

        if (saving) return //이미 저장 중이면 다시 실행하지 않도록 방지

        if (!loggedIn || !loginUserId) {
            alert("로그인 후 상품 등록이 가능합니다.")
            return
        }

        if (!productType) return alert("카테고리를 선택해주세요.")
        if (!productItem) return alert("소분류를 선택해주세요.")
        if (!productName.trim()) return alert("상품명을 입력해주세요.")
        if (!price) return alert("판매가를 입력해주세요.")
        if (!mainImagePreview) return alert("대표 이미지를 등록해주세요.")

        if (!productType || !productItem) {
            alert("카테고리를 선택해주세요.")
            return
        }
        if (!productName.trim()) {
            alert("상품명을 입력해주세요.")
            return
        }
        if (!price) {
            alert("판매가를 입력해주세요.")
            return
        }

        // 옵션 전체 비어있을 때
        if (!optionGroups || optionGroups.length === 0) {
            alert("옵션을 최소 1개 이상 등록해주세요.")
            return
        }

        // 옵션 그룹별 detail 검사
        for (const g of optionGroups) {

            // group.details 자체가 없거나 빈배열
            if (!g.details || g.details.length === 0) {
                alert("옵션을 최소 1개 이상 등록해주세요.")
                return
            }

            // 옵션명/값 입력 여부
            for (const d of g.details) {
                if (!d.optionName?.trim() || !d.optionValue?.trim()) {
                    alert("옵션명과 옵션값을 모두 입력해주세요.")
                    return
                }
            }
        }

        //옵션 재고 재고 체크
        let hasStockOver5 = false

        for (const g of optionGroups) {
            for (const d of g.details) {
                const stockNum = Number(String(d.stock || "0").replace(/[^0-9]/g, ""))
                if (stockNum >= 5) {
                    hasStockOver5 = true
                    break
                }
            }
        }

        if (!hasStockOver5) {
            alert("재고 수량이 최소 5개 이상이어야 상품 등록이 가능합니다.")
            return
        }


        if (!mainImagePreview) {
            alert("대표 이미지를 등록해주세요.")
            return
        }

        //대표이미지 Base64 변환
        let mainImageBase64 = null

        if (mainImage instanceof File) {
            //파일에서 직접 Base64 변환
            mainImageBase64 = await fileToBase64(mainImage)
        } else if (isEdit && mainImagePreview.startsWith("http")) {
            mainImageBase64 = mainImagePreview;
        } else if (mainImagePreview) {
            //Blob URL → File 형태로 변환 후 Base64 변환
            alert(mainImagePreview)
            const blob = await fetch(mainImagePreview).then(res => res.blob())
            mainImageBase64 = await fileToBase64(blob)
        }


        //추가이미지 Base64 변환 (파일/프리뷰 모두 공통처리)
        const extraBase64List = []

        for (let img of extraImages) {

            //파일이 있을 때(정상 업로드)
            if (img.file instanceof File) {
                extraBase64List.push(await fileToBase64(img.file))
                continue
            }

            if (isEdit && img.preview.startsWith("http")) {
                extraBase64List.push(img.preview)
                continue
            }

            //임시저장에서 불러온 blob URL만 있을 때
            if (img.preview) {
                const blob = await fetch(img.preview).then(res => res.blob())
                const base64 = await fileToBase64(blob)
                extraBase64List.push(base64)
                continue
            }
        }

        let rawHtml = editor.getHTML()

        /*<html>, <head> 태그 제거 (DB 저장 오류 방지)
        rawHtml = rawHtml
            .replace(/<html[^>]*>/gi, "")
            .replace(/<\/html>/gi, "")
            .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
            .trim()
*/
        //Base64 S3 URL 변환 실행
        rawHtml = await convertBase64Images(rawHtml)

        const convertedDescHtml = rawHtml

        const fixedOptionGroups = optionGroups.map(g => ({
            groupName: g.name || g.details?.[0]?.optionName || "", //그룹명(Default: 첫 옵션명)
            details: g.details.map(d => ({
                name: d.optionValue,       // SALES_OPTION_DETAIL.NAME (옵션값)
                optionName: d.optionName,  // SALES_OPTION_DETAIL.OPTION_NAME (옵션명)
                // "1,000" → 1000 으로 변환 후 숫자 변경
                price: Number(String(d.price || "0").replace(/[^0-9]/g, "")),
                stock: Number(String(d.stock || "0").replace(/[^0-9]/g, "")),
                enabled: d.saleStatus === "판매중" ? 1 : 0 // DB Enabled
            }))
        }))

        if (isEdit) {

            if (window.confirm("상품을 수정하시겠습니까?")) {

                setSaving(true)

                try {
                    await updateProduct(numBrd, {
                        userId: loginUserId,
                        productType,
                        productItem,
                        productName,
                        price: Number(price.replace(/[^0-9]/g, "")),
                        description: convertedDescHtml,
                        mainImage: mainImageBase64,
                        extraImages: extraBase64List,
                        origin,
                        status,
                        optionGroups: fixedOptionGroups
                    })

                    alert("상품이 수정되었습니다!")
                    navigate(returnTo)
                    return

                } catch (error) {
                    console.error("수정 실패:", error)
                    alert("상품 수정에 실패했습니다.")
                } finally {
                    setSaving(false)
                }

                return
            }
        }

        if (window.confirm("상품을 등록하시겠습니까?")) {

            setSaving(true) //여기서부터 실제 저장 시작이므로 saving = true

            try {
                const response = await createProduct({
                    userId: loginUserId,
                    productType,
                    productItem,
                    productName,
                    price: Number(price.replace(/[^0-9]/g, "")),
                    description: convertedDescHtml,
                    mainImage: mainImageBase64,
                    extraImages: extraBase64List,
                    origin, status,
                    optionGroups: fixedOptionGroups
                })


                alert("상품이 등록되었습니다!")
                navigate(returnTo)

                //임시저장 삭제 및 폼 초기화
                if (currentDraftId) {
                    deleteDraft(currentDraftId, loginUserId)
                    setDraftList(loadDraftList())
                }

                setProductType("")
                setProductItem("")
                setProductName("")
                setPrice("")
                setMainImage(null)
                setMainImagePreview("")
                setExtraImages([])
                setCurrentDraftId(null)
                editor.commands.clearContent()

            } catch (error) {
                console.error("저장 실패:", error)
                alert("저장에 실패했습니다.")
            } finally {
                //성공/실패 상관없이 저장 중 상태 해제
                setSaving(false)
            }
        }
    }

    useLayoutEffect(() => {
        const token = localStorage.getItem("token");
    
        if(!token) {
          alert("로그인을 해주세요.")
          window.location.href = '/member/login'
          return;
        }
    
        const role = localStorage.getItem("role")
    
        if(role!=='ROLE_PRODUCER'){
          alert('판매자 등록이 필요합니다.')
          window.location.href = '/producer/join'
          return;
        }
    })

    //상품수정
    useEffect(() => {
        if (!isEdit) return

        async function loadProduct() {
            const data = await getProductDetail(numBrd)

            let typeCode = data.board.productType

            // productType이 비어있으면 바로 return해서 categorySelect 호출 막기
            if (typeCode === null || typeCode === undefined) {
                console.error("백엔드에서 productType을 받지 못했습니다:", typeCode)
                return
            }

            // 숫자로 오는 경우 그대로 사용
            if (typeof typeCode === "number") {
            }
            else if (typeof typeCode === "string") {

                // 문자열이 숫자인 경우 → 숫자로 변환
                if (!isNaN(typeCode)) {
                    typeCode = Number(typeCode)
                } else {
                    // 문자열이 “쌀·잡곡”, “채소” 같은 label/type 일 때 변환
                    const found = categories.find(
                        c => c.type === typeCode || c.label === typeCode
                    )
                    if (found) typeCode = found.code
                }
            }

            // 최종적으로도 숫자가 아니면 categorySelect 호출 금지
            if (typeof typeCode !== "number") {
                console.error("카테고리 코드 변환 실패:", typeCode)
                return
            }

            setProductType(typeCode)
            await categorySelect(typeCode, false)

            setProductItem(data.board.productItem)

            setProductName(data.board.subject)
            setPrice(data.board.price.toLocaleString())
            setOrigin(data.board.origin)

            setMainImagePreview(data.images.find(i => i.sortOrder === 0).path)  //URL 그대로 들어올 예정
            setExtraImages(data.images.filter(i => i.sortOrder !== 0)?.map(img => ({
                file: null,
                preview: img.path
            })) || [])

            editor?.commands?.setContent(data.board.content || "")

            // 옵션 복원
            setOptionGroups(
                data.optionGroups.map(g => ({
                    name: g.groupName,
                    details: data.optionDetails.map(d => ({
                        optionName: d.optionName,
                        optionValue: d.name,
                        price: d.price,
                        stock: d.stock,
                        saleStatus: d.enabled === 1 ? "판매중" : "품절"
                    }))
                }))
            )
        }
        loadProduct()
    }, [isEdit, numBrd])

    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Stack spacing={3} sx={{ width: "90%", maxWidth: "900px", mt: -3 }}>

                {/* 임시저장 */}
                {!isEdit && (
                    <DraftAccordion
                        draftList={draftList}
                        draftExpanded={draftExpanded}
                        setDraftExpanded={setDraftExpanded}
                        loadDraftData={loadDraftData}
                        deleteDraftData={deleteDraftData}
                        formatDate={formatDate}
                    />
                )}

                {/* 제목 */}
                <Box sx={{ pl: 0.5 }}>
                    <Typography sx={{
                        fontSize: "20px", fontWeight: 600, color: "#555",
                        width: "85px", lineHeight: "25px", mt: "30px !important",
                        borderBottom: "1px solid #c4c4c4"
                    }}>
                        {isEdit ? "상품 수정" : "상품 등록"}
                    </Typography>
                </Box>

                {/* 카테고리 */}
                <CategoryAccordion
                    categoryList={categories}
                    subCategoryList={subCategoryList}
                    onSelectCategory={categorySelect}
                    productType={productType}
                    setProductType={setProductType}
                    productItem={productItem}
                    setProductItem={setProductItem}
                    categoryMode={categoryMode}
                    setCategoryMode={setCategoryMode}
                    categorySearchInput={categorySearchInput}
                    setCategorySearchInput={setCategorySearchInput}
                    categorySearchResult={categorySearchResult}
                    categorySearch={categorySearch}
                />

                {/* 상품 주요정보 */}
                <ProductInfoAccordion
                    productName={productName}
                    setProductName={setProductName}
                    price={price}
                    onPriceChange={priceChange}
                    origin={origin}
                    setOrigin={setOrigin}
                />

                <OptionAccordion
                    optionGroups={optionGroups}
                    setOptionGroups={setOptionGroups}
                    forceShowOptionList={
                        optionGroups.some(g => g.details && g.details.length > 0)
                    }
                />

                <ImageAccordion
                    mainImagePreview={mainImagePreview}
                    mainImageChange={mainImageChange}
                    extraImages={extraImages}
                    addExtraImage={addExtraImage}
                    removeExtraImage={removeExtraImage}
                />

                {/* 상세 설명 */}
                <DescriptionAccordion editor={editor} insertDescriptionImage={insertDescriptionImage} />

                {/* 버튼 */}
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                    <Button variant="outlined" fullWidth onClick={isEdit ? () => navigate(-1) : DraftBoard}
                        sx={{
                            fontSize: "12px", border: "1px solid #e5e5e5",
                            color: "#6a6a6aff", background: "#fff"
                        }} >
                        {isEdit ? "수정취소" : "임시저장"}
                    </Button>

                    <Button fullWidth onClick={saveProduct}
                        sx={{
                            fontSize: "12px", border: "1px solid #e5e5e5",
                            color: "#6a6a6aff", background: "#ffe9d6"
                        }} >
                        {isEdit ? "수정완료" : "판매하기"}
                    </Button>
                </Box>
            </Stack>
        </Box>
    )
}

export default Write;
