<template>
  <tbody>
    <tr>
      <td>
        <p  style="page-break-after:always;"></p>&nbsp;
      </td>
    </tr>
    <tr>
      <td>
        <slot></slot>
      </td>
    </tr>
  </tbody>
</template>

<script>
export default {
  name: 'page-print-break'
}
</script>