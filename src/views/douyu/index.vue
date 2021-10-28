<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.yeziyu_name"
        placeholder="歌名"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.yeziyu_data"
        placeholder="歌词弹幕"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        新增
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        title="仅导出当前页面"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        type="index"
        :index="indexMethod"
        width="55"
        label="#"
      />
      <!-- <el-table-column label="ID" prop="id"  sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="歌名" min-width="100px">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{
            row.yeziyu_name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="弹幕" min-width="110px">
        <template slot-scope="{ row }">
          <span>{{ row.yeziyu_data }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button
            v-if="row.status != 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        style=" margin-left: 50px"
      >
        <el-form-item label="歌名" prop="yeziyu_name">
          <el-input v-model="temp.yeziyu_name" placeholder="请输入歌名" />
        </el-form-item>
        <el-form-item label="弹幕" prop="yeziyu_data">
          <el-input
            v-model="temp.yeziyu_data"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="请输入对应弹幕"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 取消 </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  yeziyuList,
  yeziyuCreateArticle,
  yeziyuUpdateArticle
} from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // 基于el-pagination二次包装

export default {
  name: 'Douyu',
  components: { Pagination }, // 分页
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        yeziyu_name: undefined,
        yeziyu_data: undefined,
        sort: '+id'
      },
      sortOptions: [
        { label: 'ID 正序', key: '+id' },
        { label: 'ID 降序', key: '-id' }
      ],
      temp: {
        id: undefined,
        yeziyu_name: undefined,
        yeziyu_data: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        // 弹窗标题
        update: '修改',
        create: '新增'
      },
      rules: {
        // 判断
        yeziyu_name: [
          { required: true, message: '歌名是必填的', trigger: 'blur' }
        ],
        yeziyu_data: [
          { required: true, message: '弹幕是必填的', trigger: 'blur' }
        ]
      },
      downloadLoading: false // 导出
    }
  },
  created() {
    this.getList()
  },
  methods: {
    indexMethod(index) {
      return index + 1 + (this.listQuery.page - 1) * this.listQuery.limit
    },
    getList() {
      this.listLoading = true
      yeziyuList(this.listQuery).then((response) => {
        this.list = response.data.items
        this.total = response.data.total

        // 模拟请求的时间
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // id排序
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        yeziyu_name: undefined,
        yeziyu_data: undefined
      }
    },
    // 点击新增
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 点击表单的确定按钮
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          yeziyuCreateArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '数据新增成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 修改
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 修改表单确定按钮
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          yeziyuUpdateArticle().then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '数据修改成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 删除按钮事件
    handleDelete(row, index) {
      this.$notify({
        title: '成功',
        message: '数据删除成功',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
    },
    // 导出按钮事件
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['id', '歌名', '弹幕']
        const filterVal = ['id', 'yeziyu_name', 'yeziyu_data']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '弹幕数据'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
