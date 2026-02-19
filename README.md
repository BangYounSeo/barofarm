# Barofarm

## 프로젝트 소개
Barofarm은 농산물 직거래와 가격 예측을 지원하는 참여형 플랫폼입니다.
사용자는 생산자 게시글을 통해 상품을 구매하고, 일별 가격 정보와 ML 기반 가격 예측을 활용할 수 있습니다.
본 프로젝트는 팀 프로젝트로 진행되었으며,
저는 메인 페이지·공통 레이아웃, 상품 필터링·리스트업, 상품 등록·옵션·임시저장, AWS S3 이미지 업로드, 배너 등록 페이지 및 전반적인 UI/UX 개선을 담당했습니다.

## 프로젝트 전체 기능 개요

Barofarm은 **일반 회원(구매자)**, **판매자(생산자)**, **관리자** 역할에 따라 제공 기능이 구분됩니다.

### 공통·진입
- **메인 페이지**: 베스트·신상품 노출, 카테고리별 바로가기, 메인/중간 배너 슬라이드
- **공통 레이아웃**: 헤더(검색, 장바구니, 마이페이지), 푸터(약관·개인정보·고객센터), 팝업 모달
- **인증**: 로그인, 회원가입, OAuth2(Google/Kakao/Naver), 계정 찾기(아이디·비밀번호)

### 구매자(회원)
- **상품 탐색**: 상품 목록(카테고리·소분류·키워드 필터, 페이징), 상품 상세(이미지, 옵션, 리뷰·QnA)
- **구매**: 장바구니, 결제(Portone 연동), 주문 내역·상세
- **마이페이지**: 주문 내역, 배송지 관리, 개인정보 수정, 내 리뷰·찜·QnA, 계정 탭

### 판매자(생산자)
- **판매자 등록(온보딩)**: 약관 동의 및 판매자 신청
- **판매자 페이지**: 대시보드, 상품 목록·등록·수정(옵션·임시저장·이미지 S3 업로드), 주문 관리, 정산, 프로필

### 가격 정보·예측(데이터)
- **일별 가격**: KAMIS 등 연동 데이터 조회, 메인 데이터·상세·B2B/B2C 검색 화면
- **가격 예측**: ML 기반 예측 API(Python/Flask) 연동 화면

### 커뮤니티·안내
- **공지사항**: 목록·상세·(관리자) 작성·수정
- **QnA**: 상품/서비스 문의 목록·작성·(관리자) 답변 관리
- **리뷰**: 상품 구매 후 리뷰 작성·이미지 첨부(S3)

### 관리자
- **대시보드**: 운영 현황 요약
- **회원·판매자**: 회원 목록, 판매자(생산자) 목록·상세
- **주문**: 주문 목록·상세
- **콘텐츠**: 공지사항 작성·수정, 배너 등록·수정·삭제, 팝업 관리
- **신고·QnA**: 신고 목록·처리, QnA 답변 관리

### 기타
- **이미지 저장**: 상품·리뷰·배너 등 이미지 업로드 시 AWS S3 연동
- **결제**: Portone(아임포트) 결제 연동
- **문자**: Solapi SMS(인증·알림 등) 연동

## 기술 스택

### Backend
- Spring Boot 2.7.7
- Spring Security
- Spring Data JPA
- OAuth2 Client (Google / Kakao / Naver)
- JWT

### Frontend
- React 19
- Material UI
- HTML/CSS/JavaScript

### Database
- Oracle DB

### ML / 예측
- Python, Flask
- LightGBM, XGBoost, scikit-learn (일별 가격 예측 API)

### Server/Tool
- Apache Tomcat (Embedded)
- Gradle
- Git / Github
- AWS S3, Solapi SMS, Portone 결제, KAMIS API

## 프로젝트 구성
### 프로젝트 유형: 팀 프로젝트
### 개발 인원: 5명
### 개발 기간: 20일
### 담당 역할
- 메인 페이지 및 공통 레이아웃(헤더/푸터) 구성
- 상품 필터링 및 카테고리별 리스트업 기능 구현
- 상품 등록 페이지 및 옵션, 임시저장 기능 구현
- AWS S3 연동 이미지 업로드 기능 구축
- 배너 등록 페이지 제작
- 전반적인 UI/UX 개선 작업

## 담당 기능 상세

### 메인 페이지 및 공통 레이아웃(헤더/푸터)
- 서비스 진입점이 되는 메인 페이지(`MainPage.js`) 구성: 베스트·신상품 영역, 카테고리별 바로가기, 메인·중간 배너 슬라이드 연동
- 전역 레이아웃(`Layout.js`)에서 `Header`/`Footer`를 포함한 공통 구조와 팝업 모달 처리 구성
- 헤더: 검색, 장바구니·마이페이지 링크, 스크롤 시 검색창 숨김, 모바일 메뉴 대응
- 푸터: 이용약관·개인정보처리방침·고객센터 모달 제공으로 사용자 접근성 확보

### 상품 필터링 및 카테고리별 리스트업
- 상품 목록 페이지(`SalesBoardList.js`)에서 대분류(쌀·잡곡, 채소, 견과·버섯, 과일) 및 소분류(itemCode) 기반 필터링 구현
- 메인 페이지·헤더 검색에서 키워드/카테고리 코드 전달 시 목록 필터 자동 적용
- 백엔드 `getLists` API와 연동한 페이징·필터 상태 관리 및 배너 슬라이드 연동

### 상품 등록 페이지 및 옵션, 임시저장
- 판매자용 상품 등록/수정 화면(`Write.js`) 구성: 카테고리·상품명·가격·원산지·대표/추가 이미지·상세설명(TipTap 에디터) 아코디언 UI
- 옵션 그룹 추가/삭제 및 옵션별 가격·재고 입력(`OptionAccordion`, `WriteAccordions.js`)
- 임시저장: `DraftSave.js`를 통한 로컬 저장·불러오기·목록 조회·삭제, 수정 시 기존 임시저장 데이터 복원

### AWS S3 연동 이미지 업로드
- 백엔드: `S3Service`(바이트/멀티파트 업로드), `UploadController`의 `/api/upload/base64`로 Base64 이미지 수신 후 S3 업로드 및 URL 반환
- 상품 등록: 상세설명 내 Base64/Blob 이미지를 등록 시 S3 URL로 변환 후 저장(`Write.js`의 `convertBase64Images`)
- 리뷰 이미지·상품 대표/추가 이미지 저장 시 S3 경로 저장 구조 적용(`SalesBoardService`, `ReviewService`)

### 배너 등록 페이지 제작
- 관리자용 배너 CRUD 페이지(`AdminBannerPage.js`) 구현: 제목·본문·이미지 URL·링크 URL·정렬순서·사용여부·위치(MAIN 등) 입력
- 이미지 URL 유효성 검사 후 `BannerService`를 통해 등록·수정·삭제 및 목록 조회
- 메인·중간 배너는 `MainPage`, `SalesBoardList` 등에서 슬라이드로 노출

### 전반적인 UI/UX 개선
- Material UI 기반 컴포넌트와 반응형 레이아웃 적용, 스크롤·경로별 검색창/헤더 노출 제어
- 상품 목록·상세·장바구니·결제 흐름에서 일관된 레이아웃과 피드백(로딩, 알림) 제공

## DB 설정 구조(보안 분리)
DB 접속 정보는 보안 및 환경 분리를 위해 Git에 직접 포함하지 않았습니다.

### 설정 방식
- application.properties -> Git 제외
- application.yml -> Git 제외
- application.properties.example -> Git에 포함
- application.yml.example -> Git에 포함

### application.properties.example (주요 항목)
- spring.datasource.driver-class-name=oracle.jdbc.driver.OracleDriver
- spring.datasource.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
- spring.datasource.username=YOUR_DB_USERNAME
- spring.datasource.password=YOUR_DB_PASSWORD  
(그 외 OAuth client-id/secret, jwt.secret, naver API 등은 예시 파일 참고)

## 실행 방법

### 환경
- JDK 8 이상
- Node.js (npm)
- Oracle DB
- (선택) Python 3 — ML 예측 API 사용 시

### DB 설정
- barofarm/src/main/resources/application.properties.example  
  -> application.properties 로 복사 후 DB 계정 및 OAuth/API 정보 입력

### 실행

**백엔드**
- barofarm 폴더에서 `.\gradlew bootRun`
- API 서버: http://localhost:8080

**프론트엔드**
- client 폴더에서 `npm install` 후 `npm run start`
- 브라우저 접속: http://localhost:3000 (기본 포트)
- ※ `npm run dev` 스크립트는 없으며, `npm run start` 사용

**ML 예측 API (선택)**
- python 폴더에서 가상환경 설정 후 `pip install -r requirements.txt` (또는 필요 패키지 설치)
- `python app.py` 실행 후 예측 API 사용

## 프로젝트를 통해 얻은 점
- 메인 페이지·공통 레이아웃 설계로 일관된 사용자 진입 경험 구성
- 상품 필터링·카테고리·페이징 연동을 통한 목록 UX 설계 경험
- 상품 등록 폼(옵션·임시저장)과 에디터·이미지 업로드 흐름 구현 경험
- AWS S3 연동 이미지 업로드(Base64/멀티파트) 구축 경험
- 배너 등록·노출 연동 및 전반적인 UI/UX 개선을 통한 팀 프로젝트 책임 영역 구현 경험

## 참고
본 프로젝트는 학습 및 포트폴리오 목적의 팀 프로젝트이며, 실제 서비스 흐름을 고려한 구조로 구현되었습니다.
