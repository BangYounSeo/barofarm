import api from "./AxiosConfig";

export const join = async(form) => {
  const res = await api.post('/member/join',form)

  return res.data;
}

export const login = async(form) => {
  const res = await api.post('/member/login',form)

  return res.data
}

export const checkIdApi = async(userId) => {
  const res  = await api.post ('/member/checkId',{userId})

  return res
}

export const sendSmsApi = async(phone) => {
  const res = await api.post('/member/send-code',{phone})
}

export const verifyCode = async(phone,code) => {
  const res = await api.post('/member/verify',{phone,code})

  return res;
}

export const searchId = async(form) => {
  const res = await api.post('/member/searchId',form)

  return res;
}

export const searchPwd = async(form) => {
  const res = await api.post('/member/searchPwd',form)

  return res;
}

export const applyProducer = async(form) => {
  const res = await api.post('/producer/join',form)
}

export const verifyBizApi = async(params) => {
  const res = await api.post('/producer/verifybiz',params);

  return res.data;
}

export const getMyInfo = async() => {
  const res = await api.get('/user/me');

  return res.data;
}

export const getmyWish = async() => {
  const res = await api.get('/user/mywish')
  
  return res.data;
}

export const getmyReview = async({page=0,size=10}) => {
  const res = await api.get('/user/myreview',{params:{page,size}})
  
  return res.data;
}

export const getmyOrders = async({page=0,size=10,startDate,endDate}) => {
  const params = { page, size };

  if (startDate) params.startDate = startDate; // "YYYY-MM-DD"
  if (endDate) params.endDate = endDate;

  const res = await api.get('/user/myorders',{params})
  
  return res.data;
}

export const getmyAddresses = async() => {
  const res = await api.get('/user/myaddr')
  
  return res.data;
}

export const getmyQna = async() => {
  const res = await api.get('/user/myqna')
  
  return res.data;
}

export const deleteAllWish = async() => {
  const res = await api.delete('/user/delallwish')

  return res.data
}

export const deleteOneWish = async(goodId) => {
  const res = await api.delete(`/user/delonewish/${goodId}`)

  return res.data
}

export const changeInfo = async(editForm) => {
  await api.put('/user/changeinfo',editForm)
}

export const checkPasswordApi = async(confirmPwd) => {
  const res = await api.post('/user/confirmpwd',{pwd:confirmPwd})

  return res.data;
}

export const changePwdApi = async(changePwd) => {
  const res = await api.put('/user/changepwd',{pwd:changePwd})

  return res.data;
}

export const addAddress = async(payload) => {
  const res = await api.post('/user/addaddress',payload)

  return res.data
}

export const updateAddress = async(payload) => {
  const res = await api.put('/user/updateaddress',payload)

  return res.data
}

export const deleteAddress = async(addressId) => {
  await api.delete(`/user/deleteaddress/${addressId}`)
}

export const deleteUser = async() => {
  const res = await api.put('/user/deleteuser')

  return res.data
}

export const getMyOrderDetail = async(numPurG) => {
  const res = await api.get(`/user/myorders/${numPurG}`);

  return res.data;
}

export const getUserOrders = async({page=0,size=10}) => {
  const params = { page, size };

  const res = await api.get('/producer/userorders',{params})

  return res.data;
}

export const getPG = async({numPurD}) => {

  const res = await api.get('/producer/getPG',{params:{numPurD}})

  return res.data;
}

export const updateOrderStatus = async({numPurD,status,trackingNo}) => {
  const res = await api.put('/producer/orderstatusupdate',null,{ params:{numPurD,status,trackingNo}})
}

export const updateMyOrderStatus = async({numPurD,status,refundReason}) => {
  const res = await api.put('/user/updatemyorder',null,
    {params:{numPurD,status, refundReason}})
}

export const getProducerData = async() => {
  const res = await api.get('/producer/getdata')

  return res.data;
}

export const getSettlement = async({year,month,mode}) => {
  const res = await api.get('/producer/getsettlement',
    {params:{year,month,mode}}
  )

  return res.data;
}

export const getMyBoards = async({page=0,size=10}) => {
  const params = { page, size };

  const res = await api.get('/producer/getmyboards',{params})

  return res.data;
}