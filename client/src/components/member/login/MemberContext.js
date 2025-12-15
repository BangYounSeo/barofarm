import React, { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export const MemberContext = createContext();

const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1시간

const MemberProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [cartCount, setCartCount] = useState(0); //장바구니 수량 체크 좀 할게요

  const logoutTimerRef = useRef(null);      // JWT exp 기반 타이머
  const inactivityTimerRef = useRef(null);  // 비활성 타이머

  // 공용 타이머 클리어
  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  const logout = () => {
    clearLogoutTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setCartCount(0);
    setToken(null);
    setUserId(null);
    setRole(null);
    window.location.href = '/';
  };

  // 비활성 타이머 시작 (마지막 활동 기준 1시간 후 자동 로그아웃)
  const startInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      alert('1시간 동안 활동이 없어 자동 로그아웃됩니다.');
      logout();
    }, INACTIVITY_LIMIT);
  };

  // 로그인 성공 시 또는 저장된 토큰 복원 시 호출
  const setAuthFromToken = (jwt) => {
    clearLogoutTimer(); // 기존 타이머 초기화

    try {
      const decoded = jwtDecode(jwt);
      const { exp, sub, role } = decoded;

      const nowSec = Date.now() / 1000;

      // exp 없거나 이미 만료된 토큰이면 바로 로그아웃
      if (!exp || exp <= nowSec) {
        logout();
        return;
      }

      // JWT 만료까지 남은 시간 타이머
      const remainingMs = (exp - nowSec) * 1000;
      logoutTimerRef.current = setTimeout(() => {
        alert('로그인 시간이 만료되었습니다. 다시 로그인해 주세요.');
        logout();
      }, remainingMs);

      // 상태/로컬스토리지 업데이트
      setToken(jwt);
      setUserId(sub);
      setRole(role);
      localStorage.setItem('token', jwt);
      localStorage.setItem('userId', sub);
      localStorage.setItem('role', role);
    } catch (e) {
      console.error('토큰 디코딩 실패: ', e);
      logout();
    }
  };

  // 🔹 앱 처음 로드될 때 localStorage에 저장된 토큰 복원 + exp 체크
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    setAuthFromToken(storedToken);
  }, []);

  // 🔹 로그인 상태(token)가 있을 때만 비활성 타이머 + 활동 이벤트 등록
  useEffect(() => {
    if (!token) return; // 로그인 안 됐으면 비활성 타이머 불필요

    const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];

    const handleActivity = () => {
      startInactivityTimer();
    };

    events.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    // 로그인 직후 한 번 시작
    startInactivityTimer();

    // cleanup
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [token]); // token이 생기면(로그인), 없어지면(로그아웃) 이벤트/타이머 세팅/해제

  const loggedIn = !!token;

  const value = useMemo(
    () => ({
      loggedIn,
      logout,
      userId,
      token,
      setAuthFromToken,
      role,
      cartCount,
      setCartCount
    }),
    [loggedIn, userId, token, role, cartCount]
  );

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
};

export default MemberProvider;
