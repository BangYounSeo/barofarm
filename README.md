![header](https://capsule-render.vercel.app/api?type=transparent&height=100&section=header&text=Barofarm&fontSize=48&fontColor=4B6BFB)

## [프로젝트 소개]

Barofarm은 농산물 직거래와 가격 예측을 지원하는 참여형 플랫폼입니다.  
사용자는 생산자 게시글을 통해 상품을 구매하고, 일별 가격 정보와 ML 기반 가격 예측을 활용할 수 있습니다.  
본 프로젝트는 팀 프로젝트로 진행되었으며, 저는 메인 페이지·공통 레이아웃, 상품 필터링·리스트업, 상품 등록·옵션·임시저장, AWS S3 이미지 업로드, 배너 등록 페이지 및 전반적인 UI/UX 개선을 담당했습니다.

<br/>

## [기술 스택]

<table width="100%">
<tr>
<td width="50%" valign="top">

### Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot_2.7.7-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=for-the-badge)
![OAuth2 Client](https://img.shields.io/badge/OAuth2_Client-4285F4?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge)

</td>

<td width="50%" valign="top">

### Frontend

![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Material UI](https://img.shields.io/badge/Material_UI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![HTML/CSS/JavaScript](https://img.shields.io/badge/HTML/CSS/JavaScript-E34F26?style=for-the-badge)

</td>
</tr>

<tr>
<td valign="top">

### Database

![Oracle DB](https://img.shields.io/badge/Oracle_DB-F80000?style=for-the-badge&logo=oracle&logoColor=white)

</td>

<td valign="top">

### ML / 예측

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![LightGBM](https://img.shields.io/badge/LightGBM-2C7BE5?style=for-the-badge)
![XGBoost](https://img.shields.io/badge/XGBoost-FF6F00?style=for-the-badge)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge)

</td>
</tr>

<tr>
<td colspan="2" valign="top">

### Server / Tool

![Apache Tomcat](https://img.shields.io/badge/Apache_Tomcat-02303A?style=for-the-badge&logo=apachetomcat&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![Git / Github](https://img.shields.io/badge/Git_/_Github-F05032?style=for-the-badge&logo=git&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![Solapi SMS](https://img.shields.io/badge/Solapi_SMS-000000?style=for-the-badge)
![Portone](https://img.shields.io/badge/Portone-FF4F00?style=for-the-badge)
![KAMIS API](https://img.shields.io/badge/KAMIS_API-2E7D32?style=for-the-badge)

</td>
</tr>
</table>

<br/>

## [프로젝트 구성]

#### 프로젝트 유형 : 팀 프로젝트 / **개발 인원** : 5명 / **개발 기간** : 20일

<br/>

## [프로젝트 전체 기능 개요]

Barofarm은 **일반 회원(구매자)**, **판매자(생산자)**, **관리자** 역할에 따라 제공 기능이 구분됩니다.

<br/>

#### (1) 공통·진입
- **메인 페이지**: 베스트·신상품 노출, 카테고리별 바로가기, 메인/중간 배너 슬라이드
- **공통 레이아웃**: 헤더(검색, 장바구니, 마이페이지), 푸터(약관·개인정보·고객센터), 팝업 모달
- **인증**: 로그인, 회원가입, OAuth2(Google/Kakao/Naver), 계정 찾기(아이디·비밀번호)

#### (2) 구매자(회원)
- **상품 탐색**: 상품 목록(카테고리·소분류·키워드 필터, 페이징), 상품 상세(이미지, 옵션, 리뷰·QnA)
- **구매**: 장바구니, 결제(Portone 연동), 주문 내역·상세
- **마이페이지**: 주문 내역, 배송지 관리, 개인정보 수정, 내 리뷰·찜·QnA, 계정 탭

#### (3) 판매자(생산자)
- **판매자 등록(온보딩)**: 약관 동의 및 판매자 신청
- **판매자 페이지**: 대시보드, 상품 목록·등록·수정(옵션·임시저장·이미지 S3 업로드), 주문 관리, 정산, 프로필

#### (4) 가격 정보·예측(데이터)
- **일별 가격**: KAMIS 등 연동 데이터 조회, 메인 데이터·상세·B2B/B2C 검색 화면
- **가격 예측**: ML 기반 예측 API(Python/Flask) 연동 화면

#### (5) 커뮤니티·안내
- **공지사항**: 목록·상세·(관리자) 작성·수정
- **QnA**: 상품/서비스 문의 목록·작성·(관리자) 답변 관리
- **리뷰**: 상품 구매 후 리뷰 작성·이미지 첨부(S3)

#### (6) 관리자
- **대시보드**: 운영 현황 요약
- **회원·판매자**: 회원 목록, 판매자(생산자) 목록·상세
- **주문**: 주문 목록·상세
- **콘텐츠**: 공지사항 작성·수정, 배너 등록·수정·삭제, 팝업 관리
- **신고·QnA**: 신고 목록·처리, QnA 답변 관리

#### (7) 기타
- **이미지 저장**: 상품·리뷰·배너 등 이미지 업로드 시 AWS S3 연동
- **결제**: Portone(아임포트) 결제 연동
- **문자**: Solapi SMS(인증·알림 등) 연동

<br/>

## [담당 역할]

- 메인 페이지 및 공통 레이아웃(헤더/푸터) 구성
- 상품 필터링 및 카테고리별 리스트업 기능 구현
- 상품 등록 페이지 및 옵션, 임시저장 기능 구현
- AWS S3 연동 이미지 업로드 기능 구축
- 배너 등록 페이지 제작
- 전반적인 UI/UX 개선 작업

<br/>

## [DB 설정 구조(보안 분리)]

DB 접속 정보는 보안 및 환경 분리를 위해 Git에 직접 포함하지 않았습니다.

#### (1) 설정 방식
- application.properties -> Git 제외
- application.yml -> Git 제외
- application.properties.example -> Git에 포함
- application.yml.example -> Git에 포함

#### (2) application.properties.example (주요 항목)
- spring.datasource.driver-class-name=oracle.jdbc.driver.OracleDriver
- spring.datasource.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
- spring.datasource.username=YOUR_DB_USERNAME
- spring.datasource.password=YOUR_DB_PASSWORD  

<br/>

## [실행 방법]

#### (1) 환경
- JDK 8 이상
- Node.js (npm)
- Oracle DB
- (선택) Python 3 — ML 예측 API 사용 시

#### (2) DB 설정
- barofarm/src/main/resources/application.properties.example  
  -> application.properties 로 복사 후 DB 계정 및 OAuth/API 정보 입력

#### (3) 실행_백엔드
- barofarm 폴더에서 `.\gradlew bootRun`
- API 서버: http://localhost:8080

#### (4) 실행_프론트엔드
- client 폴더에서 `npm install` 후 `npm run start`
- 브라우저 접속: http://localhost:3000 (기본 포트)

#### (5) ML 예측 API (선택)
- python 폴더에서 가상환경 설정 후 `pip install -r requirements.txt`
- `python app.py` 실행 후 예측 API 사용

<br/>

## [프로젝트를 통해 얻은 점]

- 메인 페이지·공통 레이아웃 설계로 일관된 사용자 진입 경험 구성
- 상품 필터링·카테고리·페이징 연동을 통한 목록 UX 설계 경험
- 상품 등록 폼(옵션·임시저장)과 에디터·이미지 업로드 흐름 구현 경험
- AWS S3 연동 이미지 업로드(Base64/멀티파트) 구축 경험
- 배너 등록·노출 연동 및 전반적인 UI/UX 개선을 통한 팀 프로젝트 책임 영역 구현 경험

<br/>

## [참고]

본 프로젝트는 학습 및 포트폴리오 목적의 팀 프로젝트이며, 실제 서비스 흐름을 고려한 구조로 구현되었습니다.

<br/>

**프로젝트 발표 자료(PPT)** : https://drive.google.com/file/d/1z8lSkw8Mnkx5wUaha8YqkDgpFXgHOQ1m/view?usp=drive_link
