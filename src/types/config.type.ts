type RowSize = 1 | 2 | 3 | 4 | 5;
type ColumnSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type Orientation = 'horizontal' | 'vertical';

export type DriveConfig = {
	entity: string;
	index?: number;
};

export interface CardConfig {
	rows?: RowSize;
	columns?: ColumnSize;
	orientation?: Orientation;
	drives?: DriveConfig[];
}
