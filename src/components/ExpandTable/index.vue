<template>
  <div>
    <el-button type="primary" @click="getSelectedProductId" size="small">
      获取选中商品id</el-button
    >
    <el-button type="primary" @click="scrollToRow" size="small"
      >锚点到指定行</el-button
    >
    <el-table
      :data="tableData"
      ref="outerTable"
      class="outer-table"
      @select="outerSingleSelect"
      @select-all="outerAllSelect"
      @expand-change="outerExpandChange"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-table
            :data="tableData[scope.$index].children"
            :ref="`innerTable-${scope.$index}`"
            @select="innerSingldSelect"
            @select-all="(selection) => innerAllSelect(selection, scope.row)"
          >
            <el-table-column type="selection"></el-table-column>
            <el-table-column prop="id" label="id"></el-table-column>
            <el-table-column
              prop="productName"
              label="商品名称"
            ></el-table-column>
          </el-table>
        </template>
      </el-table-column>
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="id" label="id"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ExpandTable',

  data() {
    return {
      tableData: [],

      // 外层被选中行列表(存 id)
      selectedRow: [],
    }
  },
  mounted() {
    let personId = 0,
      productId = 100
    this.tableData = new Array(50).fill(0).map((item) => {
      const pid = personId++
      return {
        id: pid,
        name: `person ${pid}`,
        children: new Array(5).fill(0).map((item) => ({
          id: productId,
          productName: `product ${productId++}`,
          pid,
        })),
      }
    })
  },

  methods: {
    // 获取所有展开行内的表格
    getAllExpandTable(tableName = `innerTable-`) {
      const expandTableKeys = Object.keys(this.$refs).filter(
        (key) => key.startsWith(tableName) && !!this.$refs[key] // expandTable 从展开变为隐藏, ref 会取到 undifined
      )
      return expandTableKeys.map((key) => this.$refs[key])
    },
    // 打印选中商品id
    getSelectedProductId() {
      const expandTableList = this.getAllExpandTable()
      const selectedProductIdList = expandTableList.flatMap(
        ({ selection = [] }) => selection.map(({ id }) => id)
      )
      console.log(selectedProductIdList)
    },
    // 锚点到某一行
    scrollToRow() {
      const INDEX = 30
      const outerTableRef = this.$refs['outerTable']
      const allTableRows = Array.from(
        outerTableRef.$el.querySelectorAll('.el-table__row')
      )
      // 只保留`外层表格行`
      const outerTableRows = allTableRows.filter((row) =>
        row.parentNode.parentNode.parentNode.parentNode.classList.contains(
          'outer-table'
        )
      )
      outerTableRef.toggleRowExpansion(this.tableData[INDEX], true)
      const el = outerTableRows[INDEX]
      const rect = el.getBoundingClientRect()
      let top =
        rect.top +
        (document.documentElement.scrollTop || //firefox
          document.body.scrollTop || //chrome
          window.pageYOffset) //safari

      window.scrollTo({
        top,
        behavior: 'smooth',
      })
    },
    // 选择器父子联动
    // 外层全选
    async outerAllSelect(selection) {
      if (selection.length === 0) {
        this.$refs['outerTable'].data.forEach(async (_, index) => {
          if (
            `innerTable-${index}` in this.$refs &&
            !!this.$refs[`innerTable-${index}`]
          ) {
            await this.$refs[`innerTable-${index}`].clearSelection()
          }
          const _index = this.selectedRow.findIndex(
            (item) => item === this.tableData[index].id
          )
          if (_index !== -1) {
            this.$delete(this.selectedRow, _index)
          }
        })
      } else {
        this.tableData.forEach(async (item) => {
          this.outerSingleSelect(Array.of(item), item)
        })
      }
    },
    // 外层单选
    async outerSingleSelect(selection, row) {
      const isSelected = selection.includes(row)
      const rowIndex = this.tableData.findIndex((item) => item.id === row.id)
      if (isSelected) {
        if (
          this.selectedRow.findIndex(
            (item) => item === this.tableData[rowIndex].id
          ) === -1
        ) {
          this.$set(
            this.selectedRow,
            this.selectedRow.length,
            this.tableData[rowIndex].id
          )
        }

        if (
          `innerTable-${rowIndex}` in this.$refs &&
          !!this.$refs[`innerTable-${rowIndex}`]
        ) {
          await this.$refs[`innerTable-${rowIndex}`].toggleAllSelection()
        }
      } else {
        const index = this.selectedRow.findIndex(
          (item) => item === this.tableData[rowIndex].id
        )
        if (index !== -1) {
          this.$delete(this.selectedRow, index)
        }

        if (
          `innerTable-${rowIndex}` in this.$refs &&
          !!this.$refs[`innerTable-${rowIndex}`]
        ) {
          await this.$refs[`innerTable-${rowIndex}`].clearSelection()
        }
      }
    },
    // 内层全选
    async innerAllSelect(selection, faRow) {
      const faIndex = this.tableData.findIndex((item) => item.id === faRow.id)
      if (selection.length === 0) {
        const index = this.selectedRow.findIndex(
          (item) => item === this.tableData[faIndex].id
        )
        if (index !== -1) {
          this.$delete(this.selectedRow, index)
        }

        await this.$refs['outerTable'].toggleRowSelection(faRow, false)
      } else {
        if (
          this.selectedRow.findIndex(
            (item) => item === this.tableData[faIndex].id
          ) === -1
        ) {
          this.$set(
            this.selectedRow,
            this.selectedRow.length,
            this.tableData[faIndex].id
          )
        }

        await this.$refs['outerTable'].toggleRowSelection(faRow, true)
      }
    },
    // 内层单选
    async innerSingldSelect(selection, row) {
      this.$nextTick(async () => {
        const isSubSelected = selection.includes(row)
        const faIndex = this.tableData.findIndex((item) => item.id === row.pid)
        const faRow = this.tableData.find((item) => item.id === row.pid)
        if (isSubSelected) {
          const isFaSelectAll =
            this.$refs[`innerTable-${faIndex}`].store.states.isAllSelected

          if (isFaSelectAll) {
            if (
              this.selectedRow.findIndex(
                (item) => item === this.tableData[faIndex].id
              ) === -1
            ) {
              this.$set(
                this.selectedRow,
                this.selectedRow.length,
                this.tableData[faIndex].id
              )
            }
          }
          await this.$refs['outerTable'].toggleRowSelection(
            faRow,
            isFaSelectAll
          )
        } else {
          const index = this.selectedRow.findIndex(
            (item) => item === this.tableData[faIndex].id
          )
          if (index !== -1) {
            this.$delete(this.selectedRow, index)
          }

          await this.$refs['outerTable'].toggleRowSelection(faRow, false)
        }
      })
    },
    // 外层展开行状态变化
    outerExpandChange(row, expandedRows) {
      const isExpanded = expandedRows.includes(row)
      if (isExpanded) {
        const rowIndex = this.tableData.findIndex((item) => item.id === row.id)
        if (
          this.selectedRow.findIndex(
            (item) => item === this.tableData[rowIndex].id
          ) !== -1
        ) {
          const curIndexInTableData = this.tableData.findIndex(
            (item) => item.id === row.id
          )
          this.$nextTick(() => {
            const _children = this.tableData[curIndexInTableData].children
            _children.forEach((child) => {
              this.$refs[
                `innerTable-${curIndexInTableData}`
              ].toggleRowSelection(child, true)
            })
          })
        }
      }
    },
  },
}
</script>
