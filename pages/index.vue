<template>
  <div>
    <section class="max-h-screen h-[900px] flex flex-col justify-center relative z-10">
      <video src="images/3d-coin.mp4" loop muted autoplay class="absolute top-0 z-0 max-h-screen h-[900px] w-full"/>
      <div class="text-[8rem] font-bold relative z-10">
        <div>SAVE</div>
        <div>TO WIN</div>
      </div>
      <div class="flex justify-end relative">
        <div class="max-w-[40%]">
          GT-Save is a cutting-edge blockchain savings platform that provides a secure and hassle-free way for users to store their assets. 
          With weekly prize drawings, GT-Save offers an added bonus of potential rewards, creating an exciting and engaging savings experience.
        </div>
      </div>
      <div class="flex items-center gap-4 relative">
        <div class="bg-primary-100 rounded-xl px-[1.25rem] py-[0.875rem] text-netral-500">
          Deposit Now
        </div>
        <div class="flex gap-2">
          Learn More <IconsExternalLink />
        </div>
      </div>

      <div class="absolute bottom-[50%]">
        <ion-icon name="arrow-down-circle-outline"></ion-icon>
      </div>
    </section>

    <section class="max-h-screen h-[900px] flex flex-col items-center justify-center gap-[2rem]">
      <div class="text-lg"><span class="text-primary-100">Hundreds of Prizes.</span> Every. Week.</div>
      <div class="text-[9rem] text-primary-100 leading-[8rem]">$4,124</div>
      <div>Award Generated on Draw #10000. And still counting...</div>
      <div class="flex gap-4">
        <div class="border-netral-300 border-[1px] rounded-xl h-[11rem] w-[11rem] flex flex-col items-center justify-center">
          <div class="text-[3rem]">06</div>
          <div class="text-[2rem]">Days</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[11rem] w-[11rem] flex flex-col items-center justify-center">
          <div class="text-[3rem]">06</div>
          <div class="text-[2rem]">Hours</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[11rem] w-[11rem] flex flex-col items-center justify-center">
          <div class="text-[3rem]">06</div>
          <div class="text-[2rem]">Minutes</div>
        </div>
        <div class="border-netral-300 border-[1px] rounded-xl h-[11rem] w-[11rem] flex flex-col items-center justify-center">
          <div class="text-[3rem]">06</div>
          <div class="text-[2rem]">Seconds</div>
        </div>
      </div>
      <div class="bg-primary-100 rounded-xl px-[1.25rem] py-[0.875rem] text-netral-500">
        Deposit Now
      </div>
    </section>

    <section class="grid grid-cols-3 border-t-2 border-netral-300 border-b-2">
      <div class="col-span-2 flex flex-col gap-6 border-r-2 border-netral-300 p-[2rem]">
        <div class="w-[60%]">
          GTSave is a secure and transparent platform that uses blockchain technology to protect user assets. 
          This makes it a more attractive option for users who are looking for a secure and independent way to save their assets.
        </div>
        <div class="flex justify-end">
          <LogosFlower class="animate-spin-slow" />
        </div>
      </div>
      <div class="p-5 grid grid-cols-4 gap-5">
        <component v-for="(item, index) in cryptoImages" :key="index" :is="item" :size="80" class="grayscale" />
      </div>
    </section>

    <section class="py-[7rem]">
      <div class="grid grid-cols-3 gap-5">
        <div v-for="(item, index) in articles" :key="index" class="border-[1px] border-netral-300 p-3 rounded-sm grid gap-4">
          <img :src="`images/${item.image}`" class="rounded" alt="">
          <div class="line-clamp-1">{{ item.title }}</div>
          <div class="line-clamp-3">{{ item.description }}</div>
          <a :href="item.link" target="_blank" class="flex gap-2 items-center"> Read <IconsExternalLink /></a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data(){
    const cryptoImages = [
      'LogosArbitrum',
      'LogosAvalanche',
      'LogosBsc',
      'LogosCelo',
      'LogosEthereum',
      'LogosFantom',
      'LogosFilecoin',
      'LogosMoonbeam',
      'LogosOptimism',
      'LogosPolygon',
      'LogosAurora',
      'LogosBase'
    ]
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
    return {
      cryptoImages,
      articles
    }
  }
}
</script>
