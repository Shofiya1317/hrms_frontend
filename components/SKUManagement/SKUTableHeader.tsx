const SKUTableHeader = () => (
  <thead>
    <tr
      className="bg-[#F2C6441A]"
      style={{
        width: '1340px',
        height: '54px',
      }}
    >

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        SKU Code
      </th>

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Product Name
      </th>

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Assigned Vendors
      </th>

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Business Unit
      </th>

      {/* <th className="px-4 py-3 text-left font-semibold text-text-primary">
          Avg. Score
        </th> */}

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Status
      </th>

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Last Updated
      </th>

      <th className="px-4 py-3 text-left text-sm text-text-primary">
        Actions
      </th>
    </tr>
  </thead>
);

export default SKUTableHeader;
