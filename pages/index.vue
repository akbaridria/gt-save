<template>
  <div>
    <section class="min-h-[800px] py-[10rem] h-screen flex flex-col gap-10 justify-center relative z-10">
      <video src="images/3d-coin.mp4" autoplay loop autobuffer muted playsinline class="absolute top-0 z-0 max-h-screen h-[900px] w-full"/>
      <div class="text-[2rem] lg:text-[4.5rem] md:text-[3rem] xl:text-[4rem] font-bold relative z-10">
        <div>CROSS-CHAIN</div>
        <div>SAVING <br> PROTOCOL</div>
      </div>
      <div class="flex justify-start xl:justify-end relative">
        <div class="xl:max-w-[40%]">
          GT-Save is a cutting-edge blockchain savings platform that provides a secure and hassle-free way for users to store their assets. 
          With weekly prize drawings, GT-Save offers an added bonus of potential rewards, creating an exciting and engaging savings experience.
        </div>
      </div>
      <div class="flex items-center gap-4 relative">
        <a href="/deposit" class="bg-primary-100 rounded-xl px-[1.25rem] py-[0.875rem] text-netral-500 hover:opacity-90 transition-all">
          Deposit Now
        </a>
        <a href="https://github.com/akbaridria/gt-save#readme" target="_blank" class="flex gap-2">
          Learn More <IconsExternalLink />
        </a>
      </div>
    </section>

    <section class="min-h-[800px] py-[10rem] h-screen flex flex-col items-center justify-center gap-[2rem]">
      <div class="text-lg"><span class="text-primary-100">Hundreds of Prizes.</span> Every. Week.</div>
      <div class="text-[3rem] lg:text-[7rem] md:text-[6rem] xl:text-[9rem] text-primary-100 xl:leading-[8rem]">${{ prize }}</div>
      <div>Interest Generated on Draw <span class="font-bold">#{{ roundId }}</span>. And still counting...</div>
      <div class="flex gap-4">
        <div class="border-netral-300 border-[1px] rounded-xl h-[5rem] w-[5rem] xl:h-[11rem] xl:w-[11rem] lg:h-[9rem] lg:w-[9rem] md:w-[7rem] md:h-[7rem] flex flex-col items-center justify-center">
          <div class="text-[1rem] lg:text-[2rem] xl:text-[3rem]">{{ countDown.days }}</div>
          <div class="text-[0.5rem] lg:text-[1.5rem] xl:text-[2rem]">Days</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[5rem] w-[5rem] xl:h-[11rem] xl:w-[11rem] lg:h-[9rem] lg:w-[9rem] md:w-[7rem] md:h-[7rem] flex flex-col items-center justify-center">
          <div class="text-[1rem] lg:text-[2rem] xl:text-[3rem]">{{ countDown.hours }}</div>
          <div class="text-[0.5rem] lg:text-[1.5rem] xl:text-[2rem]">Hours</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[5rem] w-[5rem] xl:h-[11rem] xl:w-[11rem] lg:h-[9rem] lg:w-[9rem] md:w-[7rem] md:h-[7rem] flex flex-col items-center justify-center">
          <div class="text-[1rem] lg:text-[2rem] xl:text-[3rem]">{{ countDown.minutes }}</div>
          <div class="text-[0.5rem] lg:text-[1.5rem] xl:text-[2rem]">Minutes</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[5rem] w-[5rem] xl:h-[11rem] xl:w-[11rem] lg:h-[9rem] lg:w-[9rem] md:w-[7rem] md:h-[7rem] flex flex-col items-center justify-center">
          <div class="text-[1rem] lg:text-[2rem] xl:text-[3rem]">{{ countDown.seconds }}</div>
          <div class="text-[0.5rem] lg:text-[1.5rem] xl:text-[2rem]">Seconds</div>
        </div>
      </div>
      <a href="/deposit" class="bg-primary-100 rounded-xl px-[1.25rem] py-[0.875rem] text-netral-500 hover:opacity-90 transition-all">
        Deposit Now
      </a>
    </section>

    <section class="grid md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 border-t-2 border-netral-300 border-b-2">
      <div class=" md:col-span-2 lg:col-span-2 xl:col-span-2 flex flex-col gap-6 md:border-r-2 lg:border-r-2 xl:border-r-2 border-netral-300 p-[2rem]">
        <div class="xl:w-[60%]">
          GTSave is a secure and transparent platform that uses blockchain technology to protect user assets. 
          This makes it a more attractive option for users who are looking for a secure and independent way to save their assets.
        </div>
        <div class="flex justify-end">
          <LogosFlower class="animate-spin-slow" />
        </div>
      </div>
      <div class="p-5 grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5">
        <component v-for="(item, index) in cryptoImages" :key="index" :is="item.logo" size="60" class="grayscale hover:grayscale-0 transition-all" />
      </div>
    </section>

    <section class="py-[10rem] max-w-[1200px] mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
        <div class="text-[3.2rem] font-bold">
          Frequenly Asked <br> Questions
        </div>
        <div class="grid gap-3">
          <Accordion v-for="(item, index) in listFaq()" :key="index" :question="item.question" :answer="item.answer" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getCountDown, getPrize, getRound, listFaq } from '../scripts/helper'
const moment = require('moment');

export default {
  name: 'IndexPage',
  data(){
    const cryptoImages = require('../data/chains.json');
    const articles = [
      {
        title: 'An Introduction to the Axelar Network',
        description: 'Web3 is in its infancy, despite massive growth in demand and usage. Novel consensus mechanisms and smart contract languages are supporting new decentralized applications that aim to serve the next billion people.',
        image: 'axelar-1.jpeg',
        link: 'https://axelar.network/blog/an-introduction-to-the-axelar-network'
      },
      {
        title: 'Security at Axelar Core',
        description: 'Security is a multidimensional problem with binary outcomes. Defining the security of a system is an incredibly complex task, but with rigorous models, designs and engineering practices, we can build systems that stand up to the worst attacks.',
        image: 'axelar-2.jpeg',
        link: 'https://axelar.network/blog/security-at-axelar-core'
      },
      {
        title: 'What Is General Message Passing and How Can It Change Web3?',
        description: 'General Message Passing is more than wrapping assets and transferring them between chains: it enables a developer building on one chain to call any function on any other connected chain.',
        image: 'axelar-3.webp',
        link: 'https://axelar.network/blog/general-message-passing-and-how-can-it-change-web3'
      }
    ]
    const countDown = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
    const intervalId = 0
    const prize = 0
    const roundId = 0
    return {
      cryptoImages,
      articles,
      countDown,
      intervalId,
      prize,
      roundId,
    }
  },
  async mounted(){
    const endRound = await getCountDown()
    this.intervalId = setInterval(() => {this.formattedCountDown(endRound)}, 1000);
    this.prize = await getPrize();
    this.roundId = await getRound()
  },
  beforeDestroy() {
    clearInterval(this.intervalId)
  },
  methods: {
    listFaq,
    formattedCountDown(end) {
      const n = moment().unix();
      const diff = end - n;
      const countdown = moment.duration(diff, 'seconds')
      this.countDown.days = countdown.days();
      this.countDown.hours = countdown.hours();
      this.countDown.minutes = countdown.minutes();
      this.countDown.seconds = countdown.seconds();
    }
  }
}
</script>
