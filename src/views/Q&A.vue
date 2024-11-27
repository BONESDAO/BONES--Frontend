<script setup>
import { useGlobalStore } from "@/store/global";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import request from "@/config.js";

let id = 0;

const router = useRouter();
const store = useGlobalStore();
const qatasks = ref([]);

// 检查答案是否正确
const checkAnswer = (completed, qid, rewards) => {
  if (completed === 0) {
    request
      .post("/qa/complete", {
        id,
        qid,
        skull: rewards
      })
      .then(function (response) {
        if (response.status === 200) {
          const data = response.data;
          if (data.success) {
            const qa = qatasks.value[qid - 1];
            qa.isCorrect =
              qa.userAnswer.trim().toLowerCase() === qa.answer.toLowerCase(); // 转换为小写并比较答案
            qa.showResult = true; // 展示答案
          }
        }
      });
  }
};

// 获取答题列表
const getQuestion = () => {
  request
    .get("/qa/list", {
      params: {
        id,
      },
    })
    .then(function (response) {
      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          qatasks.value = [];
          data.qatasks.forEach((item) => {
            qatasks.value.push({
              qid: item.qid,
              question: item.question,
              answer: item.answer,
              detail: item.detail,
              rewards: Number(item.rewards),
              completed: item.completed,
              userAnswer: "", // 用户输入的答案
              showResult: false,
              isCorrect: false,
            });
          });
        }
      }
    });
};

const back = () => {
  router.back();
};

onMounted(() => {
  id = store.userId;
  getQuestion();
});
</script>

<template>
  <div class="root">
    <div class="container">
      <div class="header">
        <button class="button" @click="back">Back</button>
        <div class="title" style="font-weight: bold; letter-spacing: 1px">
          Q&A
        </div>
      </div>
      <div>
        <div v-for="qa in qatasks" :key="qa.qid" :class="{'qa': true, 'completed': qa.completed}">
          <div>
            <div>{{ qa.question }}</div>
            <div class="input-container">
              <input
                v-model="qa.userAnswer"
                :placeholder="'Enter your answer'"
                class="answer-input"
              />
              <button @click="checkAnswer(qa.completed, qa.qid, qa.rewards)" class="submit-button" :disabled="qa.showResult">
                Submit
              </button>
            </div>
            <div
              v-if="qa.showResult || qa.completed"
              :class="['result', qa.isCorrect ? 'correct' : 'incorrect']"
            >
              {{
                qa.isCorrect
                  ? `Correct! Get${qa.rewards}💀`
                  : "Incorrect ☠️ The correct answer is " + qa.answer
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../assets/css/qa.css";
</style>
