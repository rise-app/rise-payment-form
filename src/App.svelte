<script>
  import { RisePaymentForm, RisePaymentPreview } from './components/components.module.js'

  let demoToken, demoFailed, demoEdit
  function token(event) {
    console.log('HAVE TOKEN', event)
    demoToken = event.detail
  }
  function failed(event) {
    console.log('HAVE FAILED', event)
    demoFailed = event.detail
  }
  function edit(event) {
    console.log('EDIT CLICKED!', event)
    demoEdit = event.detail
  }
</script>

<style>
  .small-preview {
    width: 450px;
    height: 175px;
  }
</style>

<RisePaymentForm
  type="card"
  rise="{{
    channel_uuid: '00000000-0000-0000-0000-000000000000',
    key_public: 'pk_00000000-0000-0000-0000-000000000000',
    live_mode: false
  }}"
  nexio="{{
    live_mode: false,
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFjQQCPpaIlJKpeg irp5kLkzLB1AxHmnLk73D3TJbAGqr1QmlsWDBtMPMRpdzzUM7ZwX3kzhIuATV4Pe 7RKp3nZlVmcrT0YCQXBrTwqZNh775z58GP2kZs+gVfNqBampJPzSB/hB62KkByhE Cn6grrRjiAVwJyZVEvs/2vrxaEpO+aE16emtX12RgI5JdzdOiNyZEQteU6zRBRJE ocPWVxExaOpVVVJ5+UnW0LcalzA+lRGRTrQJ5JguAPiAOzRPTK/lYFFpCAl/F8wt oAVG1c8zO2NcQ0Pko+fmeidRFxJ/did2btV+9Mkze3mBphwFmvnxa35LF+Cs/XJHDwIDAQAB'
  }}"
  card="{{
    gateway_type: 'nexio',
    card_type: null,
    card_name: '',
    card_year: '',
    card_month: '',
    email: null,
    phone: null,
    address_1: null,
    address_2: null,
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
  on:token={token}
  on:failed={failed}
/>
<div>
  <fieldset>
    <legend>
     on:token Event
    </legend>
    <pre>
    {JSON.stringify(demoToken)}
    </pre>
  </fieldset>
</div>

<div>
  <fieldset>
    <legend>
      on:failed Event
    </legend>
    <pre>
    {JSON.stringify(demoFailed)}
    </pre>
  </fieldset>
</div>

<div class="small-preview">
<RisePaymentPreview
  type="card"
  rise="{{
    channel_uuid: '00000000-0000-0000-0000-000000000000',
    key_public: 'pk_00000000-0000-0000-0000-000000000000',
    live_mode: false
  }}"
  nexio="{{
    live_mode: false,
    publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFjQQCPpaIlJKpeg irp5kLkzLB1AxHmnLk73D3TJbAGqr1QmlsWDBtMPMRpdzzUM7ZwX3kzhIuATV4Pe 7RKp3nZlVmcrT0YCQXBrTwqZNh775z58GP2kZs+gVfNqBampJPzSB/hB62KkByhE Cn6grrRjiAVwJyZVEvs/2vrxaEpO+aE16emtX12RgI5JdzdOiNyZEQteU6zRBRJE ocPWVxExaOpVVVJ5+UnW0LcalzA+lRGRTrQJ5JguAPiAOzRPTK/lYFFpCAl/F8wt oAVG1c8zO2NcQ0Pko+fmeidRFxJ/did2btV+9Mkze3mBphwFmvnxa35LF+Cs/XJHDwIDAQAB'
  }}"
  card="{{
    card_type: 'visa',
    card_number_last: '4242',
    card_name: 'Scottie W',
    card_year: 2025,
    card_month: 12,
    can_edit: true,
    editable_fields: ['card_name', 'card_number', 'card_cvv', 'card_month', 'card_year'],
  }}"
  on:edit={edit}
/>
</div>
<div>
  <fieldset>
    <legend>on:edit Event</legend>
    <pre>
    {JSON.stringify(demoEdit)}
    </pre>
  </fieldset>
</div>
