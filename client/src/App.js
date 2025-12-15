import { Routes, Route } from "react-router-dom";
import Layout from "./components/pages/Layout";
import MainPage from "./components/pages/MainPage";
import SalesBoardList from "./components/sales/SalesBoardList";
import Join from './components/member/login/Join';
import DetailPage from './components/product/DetailPage';
import ReviewWrite from './components/product/ReviewWrite';
import CartPage from "./components/product/CartPage";
import SearchIdPwd from './components/member/login/SearchIdPwd';
import Login from './components/member/login/Login';
import MainData from './components/data/MainData';
import Detail from './components/data/Detail';
import DetailDome from './components/data/DetailDome';
import PriceSearchPageB2B from './components/data/searchEasily/PriceSearchPageB2B'
import PriceSearchPageB2C from './components/data/searchEasily/PriceSearchPageB2C'
import Write from "./components/sales/write/Write";
import OAuth2Redirect from "./components/member/login/OAuth2Redirect";
import MemberProvider from "./components/member/login/MemberContext";
import QnaList from "./components/product/QnaList";
import QnaWritePage from "./components/product/QnaWritePage";
import MyQnaPage from "./components/product/MyQnaPage";
import PaymentSuccess from "./components/product/PaymentSuccess";
import JoinProducer from "./components/member/producer/ProducerJoin";
import MyPageMain from "./components/member/myInfo/MyPageMain";
import BuyerOrdersTab from "./components/member/myInfo/BuyerOrdersTab";
import MyPage from "./components/member/myInfo/MyPage";
import AccountTab from "./components/member/myInfo/AccountTab";
import AddressTab from "./components/member/myInfo/AddressTab";
import MyReviewsTab from "./components/member/myInfo/MyReviewTab";
import MyQnaTab from "./components/member/myInfo/MyQnaTab";
import WishListTab from "./components/member/myInfo/WishListTab";
import PricePredict from "./components/data/PricePredict";
import AdminMemberList from "./components/admin/AdminMemberList";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLayout from "./components/admin/AdminLayout";
import ProducerLayout from "./components/member/producer/ProducerLayout";
import ProducerDashboard from "./components/member/producer/ProducerDashboard";
import ProductList from "./components/member/producer/ProductList";
import OrderList from "./components/member/producer/OrderList";
import SettlementPage from "./components/member/producer/SettlementPage";
import ProducerProfile from "./components/member/producer/ProducerProfile";
import BuyerOrderDetail from "./components/member/myInfo/BuyerOrderDetail";
import PaymentDetail from "./components/product/PaymentDetail";

import NoticeList from "./components/pages/notice/NoticeList";
import NoticeDetail from "./components/pages/notice/NoticeDetail";
import AdminNoticeEdit from "./components/admin/AdminNoticeEdit";
import AdminNoticeWrite from "./components/admin/AdminNoticeWrite";
import AdminNoticeList from "./components/admin/AdminNoticeList";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";
import Paymenting from "./components/product/Paymenting";
import AdminBannerPage from "./components/admin/AdminBannerPage";
import AdminProducerList from "./components/admin/AdminProducerList";
import AdminReportList from "./components/admin/AdminReportList";
import AdminPopupManage from "./components/admin/AdminPopupManage";
import { initApp } from "./initApp";
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      await initApp();     // 🔥 서버 준비될 때까지 기다림
      setReady(true);
    }
    bootstrap();
  }, []);

  if (!ready) return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={70} />
      </Box>
    ); // 여기엔 로딩 화면 넣으면 됨

  return (
    <MemberProvider>
      <Routes>
        <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
        
        {/* 관리자 라우트 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminMemberList />} />
         
          <Route path="notice" element={<AdminNoticeList />} />
          <Route path="notice/write" element={<AdminNoticeWrite />} />
          <Route path="notice/edit/:id" element={<AdminNoticeEdit />} />         
          <Route path="producers" element={<AdminProducerList />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="notice/edit/:id" element={<AdminNoticeEdit />} />          
          {/* <Route path="producers" element={<AdminProducerList />} />
          <Route path="payments" element={<AdminPaymentList />} /> */}

          <Route path="banner" element={<AdminBannerPage />} />
          
          <Route path="report" element={<AdminReportList />} />
          <Route path="popup" element={<AdminPopupManage />} />
        </Route>

        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/data/maindata" element={<MainData />} />
          <Route path="/salesboard" element={<SalesBoardList />} />
          <Route path="/sales/write" element={<Write />} />
          <Route path="/sales/edit/:numBrd" element={<Write />} />
          <Route path='/member/join' element={<Join />} />
          <Route path='/member/login' element={<Login />} />
          <Route path='/user/mypage' element={<MyPage />}>
            <Route index element={<MyPageMain />} />
            <Route path="orders" element={<BuyerOrdersTab />} />
            <Route path="address" element={<AddressTab />} />
            <Route path="reviews" element={<MyReviewsTab />} />
            <Route path="wishlist" element={<WishListTab />} />
            <Route path="qna" element={<MyQnaTab />} />
            <Route path="account" element={<AccountTab/>}/>
            <Route path="order/:numPurG" element={<BuyerOrderDetail/>}/>
          </Route>
          <Route path="/producer" element={<ProducerLayout/>}>
            <Route index element={<ProducerDashboard/>}/>
            <Route path="products" element={<ProductList/>} />
            <Route path="orders" element={<OrderList/>} />
            <Route path="settlement" element={<SettlementPage />} />
            <Route path="profile" element={<ProducerProfile />} />
          </Route>
          <Route path='/member/searchIdPwd' element={<SearchIdPwd />} />
          <Route path="/data/detail" element={<Detail />} />
          <Route path="/data/detailDome" element={<DetailDome />} />
          <Route path="/data/search/b2b" element={<PriceSearchPageB2B />} />
          <Route path="/data/search/b2c" element={<PriceSearchPageB2C />} />
          <Route path="/producer/join" element={<JoinProducer />} />
          {/* 상세페이지 데이터 */}
          <Route path="/detail/:numBrd" element={<DetailPage />} />
          {/* 리뷰 작성 데이터 */}
          <Route path="/review/write/:numBrd" element={<ReviewWrite />} />
          {/* 🔥 Q&A 전체 리스트 페이지 */}
          <Route path="/qna" element={<QnaList />} />
          {/* 🔥 Q&A 작성  */}
          <Route path="/qna/write" element={<QnaWritePage />} />
          {/* 🔥 장바구니 */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/paymentDetail" element={<PaymentDetail />} />
          {/* 🔥 결제 완료 페이지 */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/paymenting" element={<PaymentSuccess />} />
          <Route path="/data/pricePredict" element={<PricePredict />} />
          {/*  공지사항 페이지 */}
          <Route path="/notice" element={<NoticeList />} />
          <Route path="/notice/:id" element={<NoticeDetail />} />
        </Route>
      </Routes>
    </MemberProvider>
  )
}

export default App;
