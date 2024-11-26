<script setup>
import {onMounted, ref, onUnmounted, nextTick} from "vue";
import {useRouter} from "vue-router";
import {useGlobalStore} from "@/store/global";
import { WalletTgSdk } from "@uxuycom/web3-tg-sdk";
import request from "@/config.js";
//import skull1 from "@/assets/images/1.png";
//import skull2 from "@/assets/images/2.png";

const router = useRouter();
const store = useGlobalStore();

const { ethereum } = new WalletTgSdk({injected: true});
const platon = {
	chainId: "0x335f9",
	chainName: "PlatON Mainnet",
	nativeCurrency: {
		name: "LAT",
		symbol: "lat",
		decimals: 18
	},
	rpcUrls: ["https://openapi2.platon.network/rpc"],
	blockExplorerUrls: ["https://scan.platon.network"]
};

const uname = ref("");
const points = ref(0);
const level = ref("");
const progress = ref(0);
const rewards = ref([]);
const showUp = ref(false);
const box3Height = ref(0);
const attack = ref(0);
const showPrompt = ref(false);
const showContainer = ref(true);
const plusList = ref([]);
const rewardnum = ref(0);
const wallet = ref("Connect Wallet");

let id = 0;
let username = "";
let startappParam = "";
let tg = window.Telegram.WebApp;
let connected = false;
let init = false;

let nowexp = 0;
let allExp = 0;
let addExp = 0;
let flag = false;
let isUpdating = false;
let timer = null;
let nextLevel = 0;
let plusKey = 1;

// 获取用户信息
const getUserInfo = () => {
	init = true;
  // 获取用户基本信息，如果用户没有玩过游戏则创建用户
  request.post("/login", {
    id,
    username: username,
    uacceptcode: startappParam
  })
  .then(function (response) {
    if(response.status === 200){
      const data = response.data;

      uname.value = data.results.uname;
      points.value = data.results.skull;
      level.value = data.results.ulevel;
      nowexp = data.results.uexp;
      nextLevel = data.results.ulevel + 1;
      const uboneid = data.results.uboneid;
	    
	    store.userId = data.results.uid;
	    store.username = data.results.uname;
	    store.uacceptcode = data.results.uacceptcode;
			store.inviteCode = data.results.uinvitecode;
	    
      // 获取下个等级所需要的经验值并设置进度条
      request.get("/game/getNextLevelExp", {
				params: {
					nextLevel
				}
      })
      .then(function (response) {
        if(response.status === 200) {
          const data = response.data;
          allExp = data.dneedexp;
          progress.value = (nowexp / allExp) * 100;
					init = false;
        }
      })
      // 获取攻击力
      request.get("/game/getAttack", {
				params: {
					uboneid
				}
      })
      .then(function (response) {
        if(response.status === 200) {
          const data = response.data;
          attack.value = data.attack;
        }
      })
      // 获取奖励信息
      getUserRewardsInfo();
    }
  })
}

// 仅获取用户奖励信息
const getUserRewardsInfo = () => {
  request.get("/game/getRewards", {
    params: {id}
  })
  .then(function (response) {
    if(response.status === 200) {
      const data = response.data;
      rewards.value = [];
      data.rewards.forEach(element => {
        rewards.value.push(element);
      })
    }
  })
}

// 用户敲击骷髅头
const knock = async (e)=>{
	if (init) return; // 用户信息尚未初始化完成时无法点击骷髅

	const id = "plusDom" + plusKey;
	plusList.value.push({
		key: plusKey,
		id
	})
	await nextTick();
	const plusElement = document.querySelector("#" + id);
	plusElement.addEventListener("animationend", e => {
		plusList.value = plusList.value.filter(item => item.id !== e.target.id);
	})
	plusKey += 1;

	nowexp += attack.value;
	if (nowexp > allExp) {
		nowexp = allExp;
		if (nextLevel < 250) { // 如果当前已经是满级则不再有升级动作
			flag = true;
			showUp.value = true;
			box3Height.value = 7.5;
		}
	}else if(nowexp === allExp){
		addExp += attack.value;
		if (nextLevel < 250) {
			flag = true;
			showUp.value = true;
			box3Height.value = 7.5;
		}
	}else{
		addExp += attack.value;
		//points.value = points.value + attack.value;
		progress.value = ( nowexp / allExp ) * 100;
	}
	setTimeout(()=> {
		drum.src = "2.png";
	}, 1000);
	const drum = document.querySelector("#drum");
	drum.src = "1.png";
}

// const knockEnd = async (e)=>{
// 	if (init) return;
// 		const drum = document.querySelector("#drum");
// 		drum.src = "2.png";
// }


// 用户点击升级按钮
const doUp = ()=>{
	if(flag) {
		flag = false;
		showUp.value = false;
		box3Height.value = 0;
		showPrompt.value = true;
		showContainer.value = false;

		request.post("/game/upLevel", {
			id,
      nextLevel
		})
		.then(function (response) {
			if(response.status === 200){
				const data = response.data;
        rewardnum.value = data.skull;
        // 更新用户信息
        getUserInfo();
			}
		})
	}
}

// 用户在另外的页面点击了Claim按钮
const doClaim = () => {
  showPrompt.value = flag;
  showContainer.value = true;
}

// 用户在另外的页面点击了Share X 2按钮
const doShare = () => {
	// 关闭另外的页面
	doClaim();
  request.post("/game/doubleUp", {
    id,
    nextLevel
  })
  .then(function (response) {
    if(response.status === 200){
      const data = response.data;
      if (data.success) {
	      // 更新用户奖励信息
	      getUserInfo();
	      const code = store.inviteCode;
	      const botUsername = store.botUsername;
	      const shareUrl = `https://t.me/${botUsername}/bones?startapp=${code}`;
	      const shareText = `Come take a look at this powerful application! Use my invitation code: ${code}`;
	      const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
	      tg.openLink(telegramShareUrl);
	      
      }
    }

  })
}

const goRankings = () => {
  router.push('/rankings');
}

const goInvitation = () => {
  router.push("/invitation");
}

const goTask = () => {
  router.push("/task");
}

const goQA = () => {
  router.push("/qa")
}

const updateExp = () => {
	if (isUpdating || addExp === 0) return; // 如果正在更新或没有增加经验，则跳过当前请求
	isUpdating = true;
	request.post("/game/updateExp", {
		id,
		exp:addExp
	})
	.then(function (response) {
		if(response.status === 200){
			const data = response.data;
			addExp = 0;
		}
	})
	.finally(()=>{
		isUpdating = false;
	})
}

// 链接钱包
const connectWallet = async () => {
	if(connected) return;
	try {
		// 连接钱包
		const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		await swap(platon);
		wallet.value = abbreviateString(accounts[0], 5, 4);
		connected = true;
		console.log("Connected to wallet:", accounts[0]);
	} catch (error) {
		console.error("Failed to connect to wallet:", error);
	}
}

// 截断字符串
const abbreviateString = (str, frontLen = 4, backLen = 3) => {
	if (str.length <= frontLen + backLen) {
		return str;
	}
	
	const frontPart = str.substring(0, frontLen);
	const backPart = str.substring(str.length - backLen);
	return `${frontPart}...${backPart}`;
}

// 切换网络
const swap = async (targetChain) => {
	const currentChainId = await ethereum.request({ method: "eth_chainId" });
	
	if (currentChainId !== targetChain.chainId) {
		try {
			// 尝试切换到目标网络
			await ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: targetChain.chainId }],
			});
			console.log(`Switched to network: ${targetChain.chainName}`);
		} catch (switchError) {
			// 错误代码 4902 表示目标网络未添加
			if (switchError.code === 4902) {
				try {
					await ethereum.request({
						method: "wallet_addEthereumChain",
						params: [
							{
								chainId: targetChain.chainId,
								chainName: targetChain.chainName,
								nativeCurrency: targetChain.nativeCurrency,
								rpcUrls: targetChain.rpcUrls,
								blockExplorerUrls: targetChain.blockExplorerUrls,
							},
						],
					});
					console.log(`Network added successfully: ${targetChain.chainName}`);
				} catch (addError) {
					console.error("Error adding network:", addError);
				}
			} else {
				console.error("Error switching network:", switchError);
			}
		}
	} else {
		console.log("Already on the target network");
	}
}

onMounted(()=>{
	
	// window.dom.min_background_timeout_value = 10;

	/**
	 * 从TG获取用户ID、用户名、startapp 参数
	 */
	tg = window.Telegram.WebApp;
	const user = tg.initDataUnsafe.user;
	id = user.id;
	username = user.username;
	if (username === undefined) {
		username = user.first_name;
	}else if(user.first_name === undefined){
		username = user.last_name;
	}

	// 获取当前页面的 URL
	const url = new URL(window.location.href);
	// // 获取 URL 中的 startapp 参数
	startappParam = url.searchParams.get("tgWebAppStartParam");

  // 从数据库获取用户游戏相关数据，如果用户没玩过游戏则创建用户
  getUserInfo();
	
	//const knockSkull = document.querySelector("#knockSkull");
	// knockSkull.addEventListener("touchstart", async (e) => {
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// 	if (init) return; // 用户信息尚未初始化完成时无法点击骷髅
	// 	// skull.value = "/1.png";
	// 	const drum = document.querySelector("#drum");
	// 	drum.src = "1.png";
	// 	//recover.value = true;
	//
	// 	const id = "plusDom" + plusKey;
	// 	plusList.value.push({
	// 		key: plusKey,
	// 		id
	// 	})
	// 	await nextTick();
	// 	// const recoverElement = document.querySelector(".recover");
	// 	// recoverElement.addEventListener("animationend", ()=>{
	// 	// 	drum.src = "2.png";
	// 	// 	recover.value = false;
	// 	// })
	// 	const plusElement = document.querySelector("#" + id);
	// 	plusElement.addEventListener("animationend", e => {
	// 		plusList.value = plusList.value.filter(item => item.id !== e.target.id);
	// 	})
	// 	plusKey += 1;
	//
	// 	nowexp += attack.value;
	// 	progress.value = ( nowexp / allExp ) * 100;
	// 	if (nowexp > allExp) {
	// 		nowexp = allExp;
	// 		if (nextLevel < 250) { // 如果当前已经是满级则不再有升级动作
	// 			flag = true;
	// 			showUp.value = true;
	// 			box3Height.value = 7.5;
	// 		}
	// 	}else if(nowexp === allExp){
	// 		addExp += attack.value;
	// 		if (nextLevel < 250) {
	// 			flag = true;
	// 			showUp.value = true;
	// 			box3Height.value = 7.5;
	// 		}
	// 	}else{
	// 		addExp += attack.value;
	// 	}
	// });
	//
	// knockSkull.addEventListener("touchend", e => {
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// 	const drum = document.querySelector("#drum");
	// 	drum.src = "2.png";
	// });

	//一定时间自动更新用户经验值
	timer = setInterval(()=> {
		updateExp();
	}, 3000);
})
onUnmounted(()=>{
	clearInterval(timer);
	updateExp();
})
</script>

<template>
    <div class="container" v-show="showContainer">
      <div class="content">
        <div class="top">
          <div id="top">
            <b id="uname">{{uname}}</b>
            <button class="wallet" @click="connectWallet"><b>{{wallet}}</b></button>
          </div>
          <div class="boxone">
            <span>Banner About TOPOS Wallet</span>
          </div>
          <div class="points"><img src="/2.png" alt="" id="pointIcon"><span id="points">{{points.toLocaleString()}}</span></div>
          <div class="boxthree">
            <div style="display: flex;"><span id="lv"><b>   Lv.<span id="Level">{{level}}</span></b></span></div>
            <div class="progress-bar">
              <div class="progress" :style="{'width':progress+'%'}"></div>
            </div>
          </div>
        </div>
        <div class="middle">
          <div class="box2">
            <div class="box2-1" @click="goTask">
              <img src="../assets/images/font.png" alt="" style="width: 90%;">
            </div>
			<div class="box2-3" @click="goQA">
              <img src="../assets/images/task.png" alt="" style="width: 90%;">
            </div>
            <div class="box2-2"
                 @touchstart.prevent.stop="knock"
                 @mousedown.prevent.stop="knock">
              <img src="/2.png" alt="" id="drum" >
            </div>
<!--	          <div class="box2-2" id="knockSkull">-->
<!--		          <img src="/2.png" alt="" id="drum" >-->
<!--	          </div>-->
          </div>
          <div class="box3" :style="{'height':box3Height+'%'}">
            <button id="up" v-show="showUp" @click="doUp">
              <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; overflow: visible; opacity: 1; z-index: 1; fill: rgb(13, 13, 13);"><path fill="none" d="M0 0h24v24H0z"></path><path d="M2.06 5.56 1 4.5 4.5 1 8 4.5 6.94 5.56 5.32 3.94a10.457 10.457 0 0 0 1.88 8.99L6.13 14A11.974 11.974 0 0 1 3.5 6.5c0-.92.1-1.82.3-2.68L2.06 5.56zm11.79 6.06-2.68-5.37a1.498 1.498 0 0 0-2.01-.67c-.75.38-1.05 1.28-.68 2.02l4.81 9.6-3.24.8c-.33.09-.59.33-.7.66L9 19.78l6.19 2.25c.5.17 1.28.02 1.75-.22l5.51-2.75c.89-.45 1.32-1.48 1-2.42l-1.43-4.27a2 2 0 0 0-1.9-1.37h-4.56c-.31 0-.62.07-.89.21l-.82.41"></path></svg>
              <span style="font-size: large; font-size: 1.2rem;"><b>Upgrade</b></span>
            </button>
          </div>
          <div class="box1">
            <div class="name"><span><b>Your Rewards</b></span></div>
	          <div class="item" :key="index" v-for="(reward,index) in rewards" >
		          <div class="left">
			          <div class="bkgd">
				          <img v-if="reward.RewardType === 1" src="../assets/images/register.png" alt="" class="rewardicon" />
				          <img v-else-if="reward.RewardType === 2" src="../assets/images/share.png" alt="" class="rewardicon" />
				          <img v-else-if="reward.RewardType === 3" src="../assets/images/up.png" alt="" class="rewardicon" />
				          <img v-else src="../assets/images/task.png" alt="" class="rewardicon" />
			          </div>
			          <div class="rewardname"><span><b>{{reward.RewardEvent}}</b></span></div>
		          </div>
		          <div class="right">
			          <div class="num"><span><b>+{{reward.RewardSkull.toLocaleString()}}</b></span></div>
			          <img src="/2.png" alt="" id="icon">
		          </div>
	          </div>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="ranking" @click="goRankings()">
          <svg viewBox="0 0 576 512" style="width: 27px; height: 27px; overflow: visible; opacity: 1; z-index: 1; fill: rgb(229, 231, 235);"><path d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"></path></svg>
          <span id="rank" style="color: white;">ranking</span>
        </div>
        <div class="drums">
          <svg viewBox="0 0 512 512" style="width: 30px; height: 30px; overflow: visible; opacity: 1; z-index: 1; fill: rgb(13, 13, 13);"><path d="M416 400V464C416 490.5 394.5 512 368 512H320V464C320 455.2 312.8 448 304 448C295.2 448 288 455.2 288 464V512H224V464C224 455.2 216.8 448 208 448C199.2 448 192 455.2 192 464V512H144C117.5 512 96 490.5 96 464V400C96 399.6 96 399.3 96.01 398.9C37.48 357.8 0 294.7 0 224C0 100.3 114.6 0 256 0C397.4 0 512 100.3 512 224C512 294.7 474.5 357.8 415.1 398.9C415.1 399.3 416 399.6 416 400V400zM160 192C124.7 192 96 220.7 96 256C96 291.3 124.7 320 160 320C195.3 320 224 291.3 224 256C224 220.7 195.3 192 160 192zM352 320C387.3 320 416 291.3 416 256C416 220.7 387.3 192 352 192C316.7 192 288 220.7 288 256C288 291.3 316.7 320 352 320z"></path></svg>
          <span id="drums" style="color: black; z-index: 1">Skull</span>
        </div>
        <div class="drumcss1" style="z-index: 0;"></div>
        <div class="personal" @click="goInvitation">
          <svg viewBox="0 0 448 512" style="width: 21px; height: 21px; overflow: visible; opacity: 1; z-index: 1; fill: rgb(229, 231, 235);"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
          <span id="personal" style="color: white;">Frens</span>
        </div>
      </div>
	    <div class="plus-one" :key="item.key" :id="item.id" v-for="item in plusList">+{{attack}}</div>
    </div>
    <div class="prompt" v-show="showPrompt">
      <div class="first">
        <div class="emoji">
          🎉
        </div>
      </div>
      <div class="second">
        <span style="width: 70%; color: white;">Congratulations You Get <span id="rewardnum">{{rewardnum}}</span> $SKULL</span>
      </div>
      <div class="tirth">
        <button id="Claim" @click="doClaim"><b>Claim</b></button>
        <button id="Share" @click="doShare"><b>Share x 2</b></button>
      </div>
    </div>

</template>

<style scoped>
@import "../assets/css/drum.css";
</style>
