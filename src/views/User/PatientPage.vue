<script setup lang="ts">
import { getPatientList, addPatient, editPatient, deletePatient } from '@/services/user'
import { PatientList, Patient } from '@/types/user'
import { onMounted, ref, computed } from 'vue'
import { nameRules, idCardRules } from '@/utils/rules'
import { FormInstance, showConfirmDialog, showSuccessToast, showToast } from 'vant'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'

const list = ref<PatientList>([])
const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
  if (isChange.value && list.value.length) {
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    if (defPatient) {
      patientId.value = defPatient.id
      return
    }
    patientId.value = list.value[0]?.id
  }
}
onMounted(() => {
  loadList()
})

const options = [
  {
    label: '男',
    value: 1
  },
  {
    label: '女',
    value: 0
  }
]

const show = ref(false)

// 打开侧边弹框
const showPopup = (item?: Patient) => {
  if (item) {
    // 编辑
    const { id, name, idCard, gender, defaultFlag } = item
    patient.value = { id, name, idCard, gender, defaultFlag }
  } else {
    // 添加
    form.value?.resetValidation()
    patient.value = { ...initPatient }
  }
  show.value = true
}

// 表单初始值
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
const patient = ref<Patient>({ ...initPatient })

// 计算属性，切换默认值将true和false转换为1和0
const defaultFlag = computed({
  get: () => (patient.value.defaultFlag === 1 ? true : false),
  set: (value) => {
    patient.value.defaultFlag = value ? 1 : 0
  }
})

// 保存时
const form = ref<FormInstance>()
const onSubmit = async () => {
  // 表单整体校验
  await form.value?.validate()
  // 性别校验  取出身份证倒数第二位，奇数为男，偶数为女
  const gender = +patient.value.idCard.slice(-2, -1) % 2
  if (gender !== patient.value.gender) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '性别与身份证不一致\n您是否提交保存？'
    })
  }
  // 添加/编辑
  patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value)
  show.value = false
  loadList()
  showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
}

// 删除患者
const remove = async () => {
  if (patient.value.id) {
    // 1. 弹出确认框
    await showConfirmDialog({
      title: '温馨提示',
      message: `您确定要删除${patient.value.name}患者信息吗？`
    })
    // 2. 删除
    await deletePatient(patient.value.id)
    // 3. 关闭弹框
    show.value = false
    // 4. 重新加载列表
    loadList()
    // 5. 提示删除成功
    showSuccessToast('删除成功')
  }
}

// 是否是选择患者
const route = useRoute()
const isChange = computed(() => route.query.isChange === '1')

// 选中效果
const patientId = ref<string>()
const selectPatient = (item: Patient) => {
  if (isChange.value) {
    patientId.value = item.id
  }
}

// 下一步
const router = useRouter()
const store = useConsultStore()

const next = () => {
  if (!patientId.value) return showToast('请选择患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"> </cp-nav-bar>
    <!-- 头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{ item.idCard.replace(/^(.{6}).+(.{4})$/, '$1********$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}</span>
        </div>
        <div class="icon" @click.stop="showPopup(item)"><cp-icon name="user-edit" /></div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
      <!-- 底部按钮 -->
      <div class="patient-next" v-if="isChange">
        <van-button type="primary" round block @click="next">下一步</van-button>
      </div>
      <van-popup v-model:show="show" position="right">
        <cp-nav-bar
          :title="patient.id ? '编辑患者' : '添加患者'"
          right-text="保存"
          :back="() => (show = false)"
          @click-right="onSubmit"
        ></cp-nav-bar>
        <van-form autocomplete="off" ref="form">
          <van-field
            v-model="patient.name"
            :rules="nameRules"
            label="真实姓名"
            placeholder="请输入真实姓名"
          />
          <van-field
            v-model="patient.idCard"
            :rules="idCardRules"
            label="身份证号"
            placeholder="请输入身份证号"
          />
          <van-field label="性别" class="pb4">
            <!-- 单选按钮组件 -->
            <template #input>
              <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
            </template>
          </van-field>
          <van-field label="默认就诊人">
            <template #input>
              <van-checkbox v-model="defaultFlag" :icon-size="18" round />
            </template>
          </van-field>
        </van-form>
        <!-- 删除按钮 -->
        <van-action-bar v-if="patient.id">
          <van-action-bar-button text="删除" @click="remove" />
        </van-action-bar>
      </van-popup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
  }
}
// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}

.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
.pb4 {
  padding-bottom: 4px;
}
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}
</style>
