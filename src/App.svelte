<script>
  import { RisePaymentForm, RisePaymentPreview } from './components/components.module.js'
</script>

<style>
  .small-preview {
    width: 450px;
  }
</style>

<RisePaymentForm
  type="card"
  card="{{
    card_type: null,
    card_name: '',
    card_year: '',
    card_month: '',
    email: null,
    phone: null,
    address_1: null,
    address_1: null,
    address_3: null,
    city: null,
    postal_code: null,
    province_code: null,
    country_code: null,
    is_processing: false,
    errors: null,
    disabled_fields: [],
    submit_text: 'Send it'
  }}"
/>

<div class="small-preview">
<RisePaymentPreview
  type="card"
  card="{{
    card_type: 'visa',
    card_number_last: '4242',
    card_name: 'Scottie W',
    card_year: 2025,
    card_month: 12,
    can_edit: true,
    editable_fields: ['card_name', 'card_number', 'card_cvv', 'card_month', 'card_year'],
  }}"
/>
</div>
