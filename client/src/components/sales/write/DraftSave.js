const DRAFT_LIST_KEY = "productWriteDraftList";

//Base64 → File → Base64 변환 함수 (판매하기용)
export const fileToBase64 = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
    })
}

//상세설명 내 Base64 이미지를 S3 URL로 변환하는 함수 (임시저장용)
async function convertDraftDescImages(descHtml) {
    const imgRegex = /<img[^>]+src=["'](data:image[^"']+)["'][^>]*>/g
    let updatedHtml = descHtml
    let match
    let index = 0

    while ((match = imgRegex.exec(descHtml)) !== null) {
        const base64Img = match[1]
        const fileName = `draft_${Date.now()}_${index}.png`
        index++

        const formData = new FormData()
        formData.append("base64", base64Img)
        formData.append("fileName", fileName)

        const res = await fetch("http://localhost:8080/api/upload/base64", {
            method: "POST",
            body: formData,
        })

        const s3Url = (await res.text()).trim()

        if (!res.ok || !s3Url.startsWith("http")) {
            console.error("임시저장 이미지 업로드 실패:", res.status, s3Url)
            continue
        }

        //Base64 → S3 URL 치환
        updatedHtml = updatedHtml
            .replaceAll(`src="${base64Img}"`, `src="${s3Url}"`)
            .replaceAll(`src='${base64Img}'`, `src="${s3Url}"`)
    }

    return updatedHtml
}

//임시저장(saveDraft) — blob URL + S3 URL description 저장
export async function saveDraft(
    productType, productItem, productName, origin, price, editor,
    mainImage, extraImages, currentDraftId, userId, optionGroups
) {
    let descHtml = editor ? editor.getHTML() : ""

    //상세설명에 이미지는 백엔드로 넘기는게 아니라서 용량 초과함ㅠ
    //descHtml = await convertDraftDescImages(descHtml)
    //이미지 제거해서 텍스트만 저장ㅠㅠ
    descHtml = descHtml.replace(/<img[^>]*>/g, "")

    //대표이미지 blob URL 저장
    let mainImagePreview = null
    if (mainImage) {
        mainImagePreview = URL.createObjectURL(mainImage)
    }

    //추가 이미지 blob URL 저장
    const extraImageList = []
    for (let img of extraImages) {
        if (img.file) {
            const previewUrl = URL.createObjectURL(img.file)
            extraImageList.push({ preview: previewUrl })
        } else if (img.preview) {
            extraImageList.push({ preview: img.preview })
        }
    }

    const draftId = currentDraftId || Date.now()

    let draft = {
        id: draftId,
        userId: userId,
        title: productName || "제목 없음",
        savedAt: new Date().toISOString(),
        productType,
        productItem,
        productName,
        origin,
        price,
        descHtml, //이미지 없는 텍스트만 저장
        mainImage: mainImagePreview,
        extraImages: extraImageList,
        optionGroups
    }

    let allDrafts = loadDraftList()
    let userDrafts = allDrafts.filter((d) => d.userId === userId)

    const index = userDrafts.findIndex((d) => d.id === draftId)
    if (index !== -1) {
        userDrafts[index] = draft
    } else {
        userDrafts.unshift(draft)
    }

    if (userDrafts.length > 10) userDrafts.pop()

    allDrafts = [
        ...allDrafts.filter((d) => d.userId !== userId),
        ...userDrafts
    ]

    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(allDrafts))
    return draft
}

export function loadDraftList() {
    const raw = localStorage.getItem(DRAFT_LIST_KEY)
    if (!raw) return []
    try {
        return JSON.parse(raw)
    } catch {
        return []
    }
}

export function loadDraft(id) {
    const draftList = loadDraftList()
    return draftList.find((draft) => draft.id === id) || null
}

export function deleteDraft(id, userId) {
    const allDrafts = loadDraftList()

    const filtered = allDrafts.filter(
        (draft) => !(draft.id === id && draft.userId === userId)
    )

    localStorage.setItem(DRAFT_LIST_KEY, JSON.stringify(filtered))
}

//formatDate 재추가 (Write.jsx에서 사용 중)
export function formatDate(isoString) {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}
