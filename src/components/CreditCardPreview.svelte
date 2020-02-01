<script>
  // MODULES
  import { onMount, createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import { spring } from 'svelte/motion'

  import { rise, nexio, apple, stripe, rave } from '../modules'

  // IMPORTS
  export let
    isProcessing = false,
    gateway_type = 'rise',
    card_type = 'rise',

    // Required Fields
    card_name = '',
    card_number_last = '',
    card_month = '',
    card_year = '',
    card_cvv = '',

    // Optional Fields based on Gateway
    email = null,
    phone = null,
    address_1 = null,
    address_2 = null,
    address_3 = null,
    city = null,
    postal_code = null,
    province_code = null,
    country_code = null,

    // Input Errors
    errors = null,

    // Editing
    can_edit = true,
    editable_fields = []

  // LOGIC
  const dispatch = createEventDispatcher()

  // DOM controlling variables
  // Choose the background image off the last character so they aren't random each time
  let currentCardBackground = card_number_last
      ? parseInt(card_number_last.charAt(card_number_last.length-1))
      : Math.floor(Math.random()* 25 + 1)
  let minCardMonth
  let minCardYear = new Date().getFullYear()
  let amexCardMask = '#### ######'
  let otherCardMask = '#### #### ####'
  let amexCardLastMask = '#####'
  let otherCardLastMask = '####'
  let isCardFlipped = false
  let focusElementStyle = null
  let refs = {}
  let cardNumberMask
  let cardNumberLastMask

  // Available Gateways
  const GATEWAYS = {
    'rise': rise,
    'nexio': nexio,
    'rave': rave,
    'apple': apple,
    'strip': stripe
  }

  let selectedGateway = GATEWAYS[gateway_type]

  $: {

    // Set mask type
    cardNumberMask = card_type === "amex"
      ? amexCardMask
      : otherCardMask
    cardNumberLastMask = card_type === "amex"
      ? amexCardLastMask
      : otherCardLastMask
  }

  $: canEditNumber = editable_fields.includes('card_number')
  $: canEditName = editable_fields.includes('card_name')
  $: canEditMonth = editable_fields.includes('card_month')
  $: canEditYear = editable_fields.includes('card_year')
  $: canEditCvv = editable_fields.includes('card_cvv')

</script>


<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600,700|Source+Sans+Pro:400,600,700&display=swap");

  * {
    box-sizing: border-box;
  }
  *:focus {
    outline: none;
  }

  .wrapper {

  }
  @media screen and (max-width: 700px), (max-height: 500px) {
    .wrapper {
      flex-wrap: wrap;
      flex-direction: column;
    }
  }

  .card-item {
    /*max-width: 430px;*/
    /*height: 270px;*/
    max-width: 310px;
    /*height: 220px;*/
    height: 180px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    z-index: 2;
    width: 100%;
  }
  @media screen and (max-width: 480px) {
    .card-item {
      /*max-width: 310px;*/
      /*height: 220px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item {
      /*height: 180px;*/
    }
  }
  .card-item.active .card-item__side.front {
    transform: perspective(1000px) rotateY(180deg) rotateX(0deg) rotateZ(0deg);
  }
  .card-item.active .card-item__side.back {
    transform: perspective(1000px) rotateY(0) rotateX(0deg) rotateZ(0deg);
  }
  .card-item__focus {
    position: absolute;
    z-index: 3;
    border-radius: 5px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: all 0.35s cubic-bezier(0.71, 0.03, 0.56, 0.85);
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.65);
  }
  .card-item__focus:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: var(--gray-900, #08142f);
    height: 100%;
    border-radius: 5px;
    filter: blur(25px);
    opacity: 0.5;
  }
  .card-item__focus.active {
    opacity: 1;
  }
  .card-item__side {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 20px 60px 0 rgba(14, 42, 90, 0.55);
    transform: perspective(2000px) rotateY(0deg) rotateX(0deg) rotate(0deg);
    transform-style: preserve-3d;
    transition: all 0.8s cubic-bezier(0.71, 0.03, 0.56, 0.85);
    backface-visibility: hidden;
    height: 100%;
  }
  .card-item__side.back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: perspective(2000px) rotateY(-180deg) rotateX(0deg) rotate(0deg);
    z-index: 2;
    padding: 0;
    height: 100%;
  }
  .card-item__side.back .card-item__cover {
    transform: rotateY(-180deg);
  }
  .card-item__bg {
    max-width: 100%;
    display: block;
    max-height: 100%;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
  .card-item__cover {
    height: 100%;
    background-color: var(--black, #1c1d27);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border-radius: 15px;
    overflow: hidden;
  }
  .card-item__cover:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(6, 2, 29, 0.45);
  }
  .card-item__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    /*margin-bottom: 40px;*/
    /*margin-bottom: 25px;*/
    margin-bottom: 15px;
    padding: 0 10px;
  }
  @media screen and (max-width: 480px) {
    .card-item__top {
      /*margin-bottom: 25px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__top {
      /*margin-bottom: 15px;*/
    }
  }
  .card-item__chip {
    /*width: 60px;*/
    /*width: 50px;*/
    width: 40px;
  }
  @media screen and (max-width: 480px) {
    .card-item__chip {
      /*width: 50px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__chip {
      /*width: 40px;*/
    }
  }
  .card-item__type {
    /*height: 45px;*/
    /*height: 40px;*/
    height: 30px;
    max-width: 90px;
    position: relative;
    display: flex;
    justify-content: flex-end;
    /*max-width: 100px;*/
    margin-left: auto;
    width: 100%;
  }
  @media screen and (max-width: 480px) {
    .card-item__type {
      /*height: 40px;*/
      /*max-width: 90px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__type {
      /*height: 30px;*/
    }
  }

  .card-item__edit {
    -webkit-appearance: none;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAeCAYAAABuUU38AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUxJREFUeNrM1sEJwkAQBdCsngXPHsQO9O5FS7AAMVYgdqAd2IGCDWgFnryLFQiCZ8EGnJUNimiyM/tnk4HNEAg/8y6ZmMRVqz9eUJvRaSbvutCZ347bXVJy/ZnvTmdJ862Me+hAbZCTs6GHpyUi1tTSvPnqTpoWZPUa7W7ncT3vK4h4zVejy8QzM3WhVUO8ykI6jOxoGA4ig3BLHcNFSCGqGAkig2yqgpEiMsjSfY9LxYQg7L6r0X6wS29YJiYQYecemY+wHrXD1+bklGhpAhBDeu/JfIVGxaAQ9sb8CI+CQSJ+QmJg0Ii/EE2MBiIXooHRQhRCkBhNhBcEhLkwf05ZCG8ICCOpk0MULmvDSY2M8UawIRExLIQIEgHDRoghihgRIgiigBEjgiFATBACAgFgghEwSAAGgoBCBBgYAg5hYKAIFYgHBo6w9RRgAFfy160QuV8NAAAAAElFTkSuQmCC");
    background-size: 12px;
    background-position: 90% center;
    background-repeat: no-repeat;
    height: 23px;
    width: 23px;
    position: absolute;
  }

  .card-item__typeImg {
    position: absolute;
    max-width: 100%;
    object-fit: contain;
    max-height: 100%;
    object-position: top right;
  }
  .card-item__info {
    color: var(--white, #fff);
    width: 100%;
    max-width: calc(100% - 85px);
    /*padding: 10px 15px;*/
    font-weight: 500;
    display: block;
    padding: 10px;
    /*cursor: pointer;*/
  }
  @media screen and (max-width: 480px) {
    .card-item__info {
      /*padding: 10px;*/
    }
  }
  .card-item__holder {
    opacity: 0.7;
    /*font-size: 13px;*/
    /*margin-bottom: 6px;*/
    font-size: 12px;
    margin-bottom: 5px;
  }
  @media screen and (max-width: 480px) {
    .card-item__holder {
      /*font-size: 12px;*/
      /*margin-bottom: 5px;*/
    }
  }
  .card-item__wrapper {
    font-family: "Source Code Pro", monospace;
    /*padding: 25px 15px;*/
    padding: 20px 10px;
    position: relative;
    z-index: 4;
    height: 100%;
    text-shadow: 7px 6px 10px rgba(14, 42, 90, 0.8);
    userselect: none;
  }
  @media screen and (max-width: 480px) {
    .card-item__wrapper {
      /*padding: 20px 10px;*/
    }
  }
  .card-item__name {
    /*font-size: 18px;*/
    font-size: 16px;
    line-height: 1;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
  }
  @media screen and (max-width: 480px) {
    .card-item__name {
      /*font-size: 16px;*/
    }
  }
  .card-item__nameItem {
    display: inline-block;
    min-width: 8px;
    position: relative;
  }
  .card-item__number {
    font-weight: 500;
    line-height: 1;
    color: var(--white, #fff);
    /*font-size: 27px;*/
    /*margin-bottom: 35px;*/
    display: inline-block;
    /*padding: 10px 15px;*/
    /*font-size: 21px;*/
    /*margin-bottom: 15px;*/
    /*padding: 10px 10px;*/
    font-size: 19px;
    margin-bottom: 10px;
    padding: 10px 10px;
    /*cursor: pointer;*/
  }
  @media screen and (max-width: 480px) {
    .card-item__number {
      /*font-size: 21px;*/
      /*margin-bottom: 15px;*/
      /*padding: 10px 10px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__number {
      /*font-size: 19px;*/
      /*margin-bottom: 10px;*/
      /*padding: 10px 10px;*/
    }
  }
  .card-item__numberItem {
    /*width: 16px;*/
    display: inline-block;
    vertical-align: top;
    /*width: 13px;*/
    width: 12px;
  }
  .card-item__numberItem span {
    position: absolute;
  }
  .card-item__numberItem.active {
    /*width: 30px;*/
    /*width: 16px;*/
    width: 8px;
  }
  @media screen and (max-width: 480px) {
    .card-item__numberItem {
      /*width: 13px;*/
    }
    .card-item__numberItem.active {
      /*width: 16px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__numberItem {
      /*width: 12px;*/
    }
    .card-item__numberItem.active {
      /*width: 8px;*/
    }
  }
  .card-item__content {
    color: var(--white, #fff);
    display: flex;
    align-items: flex-start;
  }
  .card-item__date {
    flex-wrap: wrap;
    /*font-size: 18px;*/
    margin-left: auto;
    padding: 10px;
    display: inline-flex;
    width: 80px;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 16px;
    /*cursor: pointer;*/
  }
  @media screen and (max-width: 480px) {
    .card-item__date {
      /*font-size: 16px;*/
    }
  }
  .card-item__dateItem {
    position: relative;
    width: 22px;
  }
  .card-item__dateItem span {
    position: absolute;
    display: inline-block;
  }
  .card-item__dateTitle {
    opacity: 0.7;
    /*font-size: 13px;*/
    /*padding-bottom: 6px;*/
    width: 100%;
    font-size: 12px;
    padding-bottom: 5px;
  }
  @media screen and (max-width: 480px) {
    .card-item__dateTitle {
      /*font-size: 12px;*/
      /*padding-bottom: 5px;*/
    }
  }
  .card-item__band {
    background: rgba(0, 0, 19, 0.8);
    width: 100%;
    /*height: 50px;*/
    /*margin-top: 30px;*/
    /*margin-top: 20px;*/
    position: relative;
    z-index: 2;
    height: 40px;
    margin-top: 10px;
  }
  @media screen and (max-width: 480px) {
    .card-item__band {
      /*margin-top: 20px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__band {
      height: 40px;
      margin-top: 10px;
    }
  }
  .card-item__cvv {
    text-align: right;
    position: relative;
    z-index: 2;
    /*padding: 15px;*/
    padding: 10px 15px;
  }
  .card-item__cvv .card-item__type {
    opacity: 0.7;
  }
  @media screen and (max-width: 360px) {
    .card-item__cvv {
      /*padding: 10px 15px;*/
    }
  }
  .card-item__cvvTitle {
    padding-right: 10px;
    font-size: 15px;
    font-weight: 500;
    color: var(--white, #fff);
    margin-bottom: 5px;
  }
  .card-item__cvvBand {
    /*height: 45px;*/
    background: var(--white, #fff);
    /*margin-bottom: 30px;*/
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    color: #1a3b5d;
    font-size: 18px;
    border-radius: 4px;
    box-shadow: 0px 10px 20px -7px rgba(32, 56, 117, 0.35);

    height: 40px;
    /*margin-bottom: 20px;*/
    margin-bottom: 15px;
  }
  @media screen and (max-width: 480px) {
    .card-item__cvvBand {
      /*height: 40px;*/
      /*margin-bottom: 20px;*/
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__cvvBand {
      margin-bottom: 15px;
    }
  }

  .card-list {
    /*margin-bottom: -130px;*/
    margin-bottom: -120px;
  }
  @media screen and (max-width: 480px) {
    .card-list {
      /*margin-bottom: -120px;*/
    }
  }
</style>

<div class="wrapper" id="payment-preview-card">
  <div class="card-list">
    <div
      class="card-item"
      class:active={isCardFlipped}
    >
      <div class="card-item__side front">
        <div
          class="card-item__focus"
          class:active={focusElementStyle}
          style={focusElementStyle}
          bind:this={refs.focusElement}
        ></div>
        <div class="card-item__cover">
          <img
            alt="card"
            src={'images/' + currentCardBackground + '.jpeg'}
            class="card-item__bg"
          >
        </div>
        <div class="card-item__wrapper">
          <div class="card-item__top">
            <img
              alt="card"
              src="images/chip.png"
              class="card-item__chip"
            >
            <div class="card-item__type">
              {#if card_type}
                {#each [card_type] as card_type (card_type)}
                  <img
                    in:fly={{y:-20}}
                    out:fly={{y:20}}
                    src={'images/' + card_type + '.png'}
                    alt={card_type}
                    class="card-item__typeImg"
                  >
                {/each}
              {/if}
            </div>
          </div>
          <label class="card-item__number" bind:this={refs.card_number_last}>
            {#if can_edit && canEditNumber}
              <div class="card-item__edit"></div>
            {/if}
            {#each cardNumberMask as n, index (index)}
              <div class="card-item__numberItem" class:active={n.trim() === ''}>
                  <span
                    in:fly={{y:-10}}
                    out:fly={{y:10}}
                  >{n}</span>
              </div>
            {/each}
            {#each cardNumberLastMask as n, index (index)}
              <div class="card-item__numberItem" class:active={n.trim() === ''}>
                {#if card_number_last && card_number_last.length > index}
                  <span
                    in:fly={{y:-10}}
                    out:fly={{y:10}}
                  >{card_number_last[index]}</span>
                {:else}
                  <span
                    in:fly={{y:-10}}
                    out:fly={{y:10}}
                  >{n}</span>
                {/if}
              </div>
            {/each}
          </label>
          <div class="card-item__content">
            <label class="card-item__info" bind:this={refs.card_name}>
              {#if can_edit && canEditName}
                <div class="card-item__edit"></div>
              {/if}
              <div class="card-item__holder">Card Holder</div>
              {#if card_name && card_name.length}
                <div class="card-item__name">
                  {#each card_name.replace(/\s\s+/g, ' ') as n, index (index + 1)}
                    {#if index == index}
                      <span
                        in:fly={{y:-6}}
                        class="card-item__nameItem"
                      >{n}</span>
                    {/if}
                  {/each}
                </div>
              {:else}
                <div
                  in:fly={{y:-6}}
                  class="card-item__name placeholder"
                >Full Name</div>
              {/if}
            </label>
            <div class="card-item__date" bind:this={refs.cardDate}>
              <label class="card-item__dateTitle">Expires</label>
              <label class="card-item__dateItem">
                {#if can_edit && canEditMonth}
                  <div class="card-item__edit"></div>
                {/if}
                {#each [card_month] as card_month (card_month)}
                  <span
                    in:fly={{y:-6}}
                    out:fly={{y:6}}
                  >{card_month || 'MM'}</span>
                {/each}
              </label>
              /
              <label class="card-item__dateItem">
                {#if can_edit && canEditYear}
                  <div class="card-item__edit"></div>
                {/if}
                {#each [card_year] as card_year (card_year)}
                  <span in:fly={{y:-6}} out:fly={{y:6}}>{card_year ? String(card_year).slice(2,4) : 'YY'}</span>
                {/each}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="card-item__side back">
        <div class="card-item__cover">
          <img alt="card" src={'images/' + currentCardBackground + '.jpeg'} class="card-item__bg">
        </div>
        <div class="card-item__band"></div>
        <div class="card-item__cvv">
          <div class="card-item__cvvTitle">CVV</div>
          <div class="card-item__cvvBand">
            {#if can_edit && canEditCvv}
              <div class="card-item__edit"></div>
            {/if}
            {card_cvv}
          </div>
          <div class="card-item__type">
            {#if card_type}
              {#each [card_type] as card_type (card_type)}
                <img in:fly={{y:-20}} out:fly={{y:20}} alt="card" src={'images/' + card_type + '.png'} class="card-item__typeImg">
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
