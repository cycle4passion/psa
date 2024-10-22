export type Data = {
	date: Date;
	psa: number;
	psadt?: number;
	psavel?: number;
};

export type DataPoints = {
	date: Date;
	test?: string;
	psa?: number;
	psadt?: number;
	psavel?: number;
	value?: number;
	comment?: string;
};

