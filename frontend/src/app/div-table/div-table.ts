import { Component, model } from "@angular/core";

export class TableModel {
	head?: string[];
	body: string[][];
	headingsColumn: boolean = false;
	protected _cols: number = 0;

	constructor(rows: number, cols: number, fill: string, head: boolean);
	constructor(tableModel: TableModel);
	constructor(rowsOrTableModel: number | TableModel = 0, cols = 0, fill = "", head = false) {
		if (typeof rowsOrTableModel == "number") {
			this._cols = cols;
			this.body = Array(rowsOrTableModel).map(() => Array(cols).fill(fill));

			if (head) {
				this.head = Array(cols).fill("");
			}
		} else {
			this.head = rowsOrTableModel.head;
			this.body = rowsOrTableModel.body;
			this.headingsColumn = rowsOrTableModel.headingsColumn;
			this._cols = rowsOrTableModel._cols;
		}
	}

	get cols() { return this._cols; }

	get rows() { return this.body.length; }

	addHead() {
		if (this.head == undefined) {
			this.head = Array(this._cols).fill("");
			return true;
		} else return false;
	}

	removeHead() {
		if (this.head != undefined) {
			this.head = undefined;
			return true;
		} else return false;
	}

	spliceRows(index: number, deleteQty: number = Infinity, ...rows: string[][]) {
		this._spliceAux(index, rows, "row");

		return this.body.splice(index, deleteQty, ...rows.map(row => [...row]));
	}

	spliceCols(index: number, deleteQty: number = Infinity, ...cols: string[][]) {
		this._spliceAux(index, cols, "column");

		let change = this._cols - index;
		change = deleteQty > change ? change : deleteQty;
		let deleted = Array(change).map(() => Array(this.body.length));

		for (let i = 0; i < this.body.length; ++i) {
			let row = this.body[i].splice(index, deleteQty, ...cols.map(col => col[i]));
			deleted.forEach((col, j) => col[i] = row[j]);
		}
		change = cols.length - change;

		if (this.head != undefined) {
			this.head.splice(index, deleteQty, ...Array(cols.length).fill(""));
		}

		this._cols += change;
		return deleted;
	}

	protected _spliceAux(index: number, rowsOrCols: string[][],
	                     direction: "row" | "column") {
		let [length1, length2] = direction === "row" ?
			[this.body.length, this._cols] : [this._cols, this.body.length];
		if (index > length1) {
			throw new RangeError(`${direction} index out of range (tables are non-sparse)`);
		}
		let invalid = rowsOrCols.find(vec => vec.length != length2);
		if (invalid != undefined) {
			throw new TypeError(`unmatched number of ${direction}s: ` +
			                    `expected=${length2}, actual=${invalid.length}`);
		}
	}

	at(rowIndex: number): string[] | undefined;
	at(rowIndex: number, colIndex: number): string | undefined;
	at(rowIndex: number, colIndex?: number): string[] | string | undefined {
		let row = this.body.at(rowIndex);
		if (row == undefined) return undefined;
		if (colIndex == undefined) {
			return [...row];
		}
		return row.at(colIndex);
	}

	put(rowIndex: number, row: string[]): void;
	put(rowIndex: number, colIndex: number, elem: string): void;
	put(rowIndex: number, colIndexOrRow: string[] | number, elem?: string): void {
		if (rowIndex >= this.body.length) {
			throw new RangeError("row index out of range (tables are non-sparse)");
		}
		if (rowIndex < 0) {
			rowIndex += this.body.length;
			if (rowIndex < 0) {
				throw new RangeError("row index out of range");
			}
		}

		if (typeof colIndexOrRow == "number") {
			if (colIndexOrRow >= this._cols) {
				throw new RangeError("column index out of range (tables are non-sparse)");
			}
			if (colIndexOrRow < 0) {
				colIndexOrRow += this._cols;
				if (colIndexOrRow < 0) {
					throw new RangeError("column index out of range");
				}
			}

			this.body[rowIndex][colIndexOrRow] = elem as string;
		} else {
			this.spliceRows(rowIndex, 1, colIndexOrRow);
		}
	}

	pushRow(row: string[]) {
		this._pushAux(row, "row");
		this.body.push(row);
	}

	pushCol(col: string[]) {
		this._pushAux(col, "column");

		for (let i = 0; i < this.body.length; ++i) {
			this.body[i].push(col[i]);
		}
		if (this.head != undefined) {
			this.head.push("");
		}

		this._cols++;
	}

	protected _pushAux(rowOrCol: string[], direction: "row" | "column") {
		let length = direction === "row" ? this._cols : this.body.length;
		if (rowOrCol.length != length) {
			throw new TypeError(`unmatched number of ${direction}s: ` +
			                    `expected=${length}, actual=${rowOrCol.length}`);
		}
	}

	static isEqual(t1: TableModel, t2: TableModel): boolean {
		return t1.rows === t2.rows && t1._cols === t2._cols
			&& t1.headingsColumn === t2.headingsColumn
			&& (t1.head == undefined) === (t2.head == undefined)
			&& (t1.head === t2.head || (t1.head as string[]).every((e, i) => e === (t2.head as string[])[i]) )
			&& (t1.body === t2.body || t1.body.every((r, i) => {
				r === t2.body[i] || t2.body[i].every((e, j) => r[j] === e); })
			)
	}
}

@Component({
	selector: "div.div-table",
	imports: [],
	templateUrl: "./div-table.html",
	styleUrl: "./div-table.css",
})
export class DivTable {
	readonly model = model.required<TableModel>();
}
